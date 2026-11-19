import os
import csv
import ast
import time
from typing import List, Dict, Any, Tuple
import openpyxl
from test_engine.safe_runner import SafeRunner

class BlackBoxEngine:
    """
    Executes Black Box Testing via CSV/Excel uploads or Manual Form input.
    Tests behavior against the uploaded Python target without inspecting internal code.
    """

    @staticmethod
    def parse_input_value(raw_val: Any) -> Any:
        if raw_val is None:
            return None
        s = str(raw_val).strip()
        if not s:
            return ""

        # Try evaluating as Python literal (int, float, list, dict, bool, tuple)
        try:
            # Handle comma separated values e.g. "10, 20" -> (10, 20)
            if "," in s and not (s.startswith("[") or s.startswith("(") or s.startswith("{")):
                return tuple(ast.literal_eval(part.strip()) for part in s.split(","))
            return ast.literal_eval(s)
        except Exception:
            # Return as bare string if literal parsing fails
            return s

    @staticmethod
    def compare_outputs(actual: Any, expected: Any) -> Tuple[bool, str]:
        actual_str = str(actual).strip() if actual is not None else "None"
        expected_str = str(expected).strip() if expected is not None else "None"

        # 1. Exact string match
        if actual_str == expected_str:
            return True, "Outputs matched exactly."

        # 2. Case-insensitive string match
        if actual_str.lower() == expected_str.lower():
            return True, "Outputs matched (case-insensitive)."

        # 3. Numeric comparison
        try:
            if float(actual_str) == float(expected_str):
                return True, "Numeric values matched."
        except (ValueError, TypeError):
            pass

        # 4. Strip surrounding quotes and re-compare
        clean_act = actual_str.strip("'\"")
        clean_exp = expected_str.strip("'\"")
        if clean_act.lower() == clean_exp.lower():
            return True, "Outputs matched after string normalization."

        return False, f"Assertion Mismatch: Expected '{expected_str}', but validator returned '{actual_str}'."

    @staticmethod
    def execute_manual_test(file_path: str, function_name: str, input_str: str, expected_str: str) -> Dict[str, Any]:
        parsed_input = BlackBoxEngine.parse_input_value(input_str)
        run_res = SafeRunner.run_function_isolated(file_path, function_name, parsed_input)

        if not run_res["success"]:
            return {
                "test_case_id": "MANUAL-01",
                "function_name": function_name,
                "input": input_str,
                "expected": expected_str,
                "actual": run_res["error"] or "Execution Error",
                "status": "FAIL",
                "error_message": run_res["error"] or "Process terminated with error",
                "duration_ms": run_res["duration_ms"]
            }

        actual_val = run_res["result"]
        is_pass, reason = BlackBoxEngine.compare_outputs(actual_val, expected_str)

        return {
            "test_case_id": "MANUAL-01",
            "function_name": function_name,
            "input": input_str,
            "expected": expected_str,
            "actual": str(actual_val),
            "status": "PASS" if is_pass else "FAIL",
            "error_message": None if is_pass else reason,
            "duration_ms": run_res["duration_ms"]
        }

    @staticmethod
    def execute_file_tests(file_path: str, test_file_path: str) -> List[Dict[str, Any]]:
        ext = os.path.splitext(test_file_path)[1].lower()
        test_cases = []

        if ext == ".csv":
            test_cases = BlackBoxEngine._read_csv(test_file_path)
        elif ext in [".xlsx", ".xls"]:
            test_cases = BlackBoxEngine._read_excel(test_file_path)
        else:
            raise ValueError(f"Unsupported test case format: '{ext}'. Please upload CSV or Excel (.xlsx).")

        results = []
        for tc in test_cases:
            tc_id = tc.get("test_case_id") or tc.get("id") or f"TC-{len(results)+1:03d}"
            func_name = tc.get("function_name") or tc.get("function")
            raw_input = tc.get("input_values") if "input_values" in tc else tc.get("input", "")
            raw_expected = tc.get("expected_output") if "expected_output" in tc else tc.get("expected", "")

            if not func_name:
                results.append({
                    "test_case_id": tc_id,
                    "function_name": "Unknown",
                    "input": str(raw_input),
                    "expected": str(raw_expected),
                    "actual": "Missing Function Name",
                    "status": "FAIL",
                    "error_message": "Missing 'Function Name' column in test case row.",
                    "duration_ms": 0.0
                })
                continue

            parsed_input = BlackBoxEngine.parse_input_value(raw_input)
            run_res = SafeRunner.run_function_isolated(file_path, func_name, parsed_input)

            if not run_res["success"]:
                results.append({
                    "test_case_id": tc_id,
                    "function_name": func_name,
                    "input": str(raw_input),
                    "expected": str(raw_expected),
                    "actual": run_res["error"] or "Execution Error",
                    "status": "FAIL",
                    "error_message": run_res["error"] or "Execution failed inside sandbox",
                    "duration_ms": run_res["duration_ms"]
                })
            else:
                actual_val = run_res["result"]
                is_pass, reason = BlackBoxEngine.compare_outputs(actual_val, raw_expected)
                results.append({
                    "test_case_id": tc_id,
                    "function_name": func_name,
                    "input": str(raw_input),
                    "expected": str(raw_expected),
                    "actual": str(actual_val),
                    "status": "PASS" if is_pass else "FAIL",
                    "error_message": None if is_pass else reason,
                    "duration_ms": run_res["duration_ms"]
                })

        return results

    @staticmethod
    def _normalize_key(key: str) -> str:
        return key.strip().lower().replace(" ", "_").replace("-", "_")

    @staticmethod
    def _read_csv(path: str) -> List[Dict[str, Any]]:
        cases = []
        with open(path, "r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            for row in reader:
                norm_row = {BlackBoxEngine._normalize_key(k): v for k, v in row.items() if k}
                cases.append(norm_row)
        return cases

    @staticmethod
    def _read_excel(path: str) -> List[Dict[str, Any]]:
        cases = []
        wb = openpyxl.load_workbook(path, data_only=True)
        sheet = wb.active

        headers = []
        for cell in sheet[1]:
            val = str(cell.value or "").strip()
            headers.append(BlackBoxEngine._normalize_key(val))

        for row in sheet.iter_rows(min_row=2, values_only=True):
            if not any(row):
                continue
            row_dict = {}
            for h, v in zip(headers, row):
                if h:
                    row_dict[h] = str(v) if v is not None else ""
            cases.append(row_dict)

        return cases

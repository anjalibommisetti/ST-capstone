import os
import sys
import uuid
import shutil
import tempfile
import subprocess
import time
from typing import Dict, Any, Optional

FORBIDDEN_CALLS = [
    "os.system",
    "subprocess.Popen",
    "subprocess.run",
    "subprocess.call",
    "shutil.rmtree",
    "import pty",
    "import socket",
    "import ctypes",
    "eval(",
    "exec(",
    "__import__('os')",
    "__import__('subprocess')",
]

class SecurityViolationError(Exception):
    pass

class SafeRunner:
    """
    Executes Python functions or scripts inside an isolated subprocess
    with strict timeout limits, security scanning, and temporary sandbox directories.
    """

    @staticmethod
    def validate_code_safety(code_str: str):
        for pattern in FORBIDDEN_CALLS:
            if pattern in code_str:
                raise SecurityViolationError(f"Security policy block: Disallowed call or pattern '{pattern}' detected.")

    @staticmethod
    def run_function_isolated(
        file_path: str,
        func_name: str,
        input_args: Any,
        timeout_seconds: int = 5
    ) -> Dict[str, Any]:
        """
        Executes a specific function with given inputs inside an isolated Python process.
        Returns a dict containing:
        - success: bool
        - result: Any (string representation or parsed object)
        - stdout: str
        - stderr: str
        - duration_ms: float
        - error: Optional[str]
        """
        run_id = f"sandbox_{uuid.uuid4().hex[:10]}"
        sandbox_dir = os.path.join(tempfile.gettempdir(), "testfusion_sandbox", run_id)
        os.makedirs(sandbox_dir, exist_ok=True)

        module_filename = os.path.basename(file_path)
        sandbox_module_path = os.path.join(sandbox_dir, module_filename)
        runner_script_path = os.path.join(sandbox_dir, "runner.py")

        try:
            # 1. Read and validate source file
            with open(file_path, "r", encoding="utf-8") as f:
                code_content = f.read()

            SafeRunner.validate_code_safety(code_content)

            # Copy module into sandbox
            with open(sandbox_module_path, "w", encoding="utf-8") as f:
                f.write(code_content)

            module_name = os.path.splitext(module_filename)[0]

            # 2. Build isolated runner script
            runner_code = f"""import sys
import json
import traceback
import importlib

try:
    mod = importlib.import_module("{module_name}")
    if not hasattr(mod, "{func_name}"):
        print(json.dumps({{"error": "Function '{func_name}' not found in module '{module_name}'."}}))
        sys.exit(2)
        
    func = getattr(mod, "{func_name}")
    raw_args = {repr(input_args)}
    
    if isinstance(raw_args, tuple):
        res = func(*raw_args)
    elif isinstance(raw_args, list):
        # If function expects 1 argument that is a list, pass list directly
        # If it expects multiple arguments, unpack
        import inspect
        sig = inspect.signature(func)
        param_count = len(sig.parameters)
        if param_count == len(raw_args) and param_count > 1:
            res = func(*raw_args)
        else:
            res = func(raw_args)
    elif raw_args is None:
        res = func()
    else:
        res = func(raw_args)
        
    print("__TESTFUSION_OUTPUT_START__")
    print(repr(res))
    print("__TESTFUSION_OUTPUT_END__")
    sys.exit(0)
except Exception as e:
    print("__TESTFUSION_ERROR_START__")
    traceback.print_exc(file=sys.stdout)
    print("__TESTFUSION_ERROR_END__")
    sys.exit(1)
"""
            with open(runner_script_path, "w", encoding="utf-8") as f:
                f.write(runner_code)

            # 3. Execute in subprocess with timeout
            start_time = time.time()
            env = {
                "PYTHONPATH": sandbox_dir,
                "PATH": os.environ.get("PATH", ""),
                "SYSTEMROOT": os.environ.get("SYSTEMROOT", "C:\\Windows")
            }

            process = subprocess.Popen(
                [sys.executable, "-u", runner_script_path],
                cwd=sandbox_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                env=env
            )

            try:
                stdout, stderr = process.communicate(timeout=timeout_seconds)
                duration_ms = round((time.time() - start_time) * 1000, 2)
            except subprocess.TimeoutExpired:
                process.kill()
                stdout, stderr = process.communicate()
                return {
                    "success": False,
                    "result": None,
                    "stdout": stdout,
                    "stderr": stderr,
                    "duration_ms": timeout_seconds * 1000,
                    "error": f"Execution Timed Out: Terminated after {timeout_seconds} seconds."
                }

            exit_code = process.returncode

            # Extract output
            if "__TESTFUSION_OUTPUT_START__" in stdout and "__TESTFUSION_OUTPUT_END__" in stdout:
                raw_out = stdout.split("__TESTFUSION_OUTPUT_START__")[1].split("__TESTFUSION_OUTPUT_END__")[0].strip()
                # Unquote string repr if needed
                if (raw_out.startswith("'") and raw_out.endswith("'")) or (raw_out.startswith('"') and raw_out.endswith('"')):
                    result_val = raw_out[1:-1]
                else:
                    result_val = raw_out

                return {
                    "success": exit_code == 0,
                    "result": result_val,
                    "stdout": stdout,
                    "stderr": stderr,
                    "duration_ms": duration_ms,
                    "error": None
                }
            elif "__TESTFUSION_ERROR_START__" in stdout:
                err_text = stdout.split("__TESTFUSION_ERROR_START__")[1].split("__TESTFUSION_ERROR_END__")[0].strip()
                last_line = err_text.splitlines()[-1] if err_text.splitlines() else err_text
                return {
                    "success": False,
                    "result": None,
                    "stdout": stdout,
                    "stderr": stderr,
                    "duration_ms": duration_ms,
                    "error": last_line
                }
            else:
                return {
                    "success": False,
                    "result": None,
                    "stdout": stdout,
                    "stderr": stderr,
                    "duration_ms": duration_ms,
                    "error": stderr.strip() if stderr else f"Process exited with code {exit_code}"
                }

        except SecurityViolationError as sve:
            return {
                "success": False,
                "result": None,
                "stdout": "",
                "stderr": str(sve),
                "duration_ms": 0,
                "error": str(sve)
            }
        except Exception as e:
            return {
                "success": False,
                "result": None,
                "stdout": "",
                "stderr": str(e),
                "duration_ms": 0,
                "error": f"Runner Error: {str(e)}"
            }
        finally:
            # Clean up sandbox
            try:
                shutil.rmtree(sandbox_dir, ignore_errors=True)
            except Exception:
                pass

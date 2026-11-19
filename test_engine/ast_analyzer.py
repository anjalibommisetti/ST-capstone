import ast
from typing import Dict, List, Any, Optional

class AstAnalyzer:
    """
    Analyzes Python source code using the ast standard module.
    Extracts functions, arguments, decision points, loops, line numbers,
    and calculates Cyclomatic Complexity.
    """

    @staticmethod
    def analyze_source(code_str: str) -> Dict[str, Any]:
        result = {
            "is_valid": True,
            "syntax_error": None,
            "total_lines": len(code_str.splitlines()),
            "functions": [],
            "total_statements": 0,
            "decision_points": 0,
            "loop_points": 0,
            "cyclomatic_complexity": 1
        }

        try:
            tree = ast.parse(code_str)
        except SyntaxError as e:
            result["is_valid"] = False
            result["syntax_error"] = {
                "message": e.msg,
                "line": e.lineno,
                "offset": e.offset,
                "text": e.text
            }
            return result

        total_decisions = 0
        total_loops = 0
        statement_count = 0

        # Traverse AST nodes
        for node in ast.walk(tree):
            if isinstance(node, (ast.If, ast.IfExp)):
                total_decisions += 1
            elif isinstance(node, (ast.For, ast.While, ast.AsyncFor)):
                total_loops += 1
            elif isinstance(node, (ast.stmt)):
                statement_count += 1

        # Extract function definitions
        for node in ast.iter_child_nodes(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                func_decisions = 0
                func_loops = 0
                func_stmts = 0

                for subnode in ast.walk(node):
                    if isinstance(subnode, (ast.If, ast.IfExp)):
                        func_decisions += 1
                    elif isinstance(subnode, (ast.For, ast.While, ast.AsyncFor)):
                        func_loops += 1
                    elif isinstance(subnode, ast.stmt):
                        func_stmts += 1

                args_list = []
                # Positional and keyword args
                for a in node.args.args:
                    args_list.append(a.arg)

                docstring = ast.get_docstring(node) or "No docstring provided"

                end_lineno = getattr(node, 'end_lineno', node.lineno)

                func_info = {
                    "name": node.name,
                    "args": args_list,
                    "start_line": node.lineno,
                    "end_line": end_lineno,
                    "docstring": docstring,
                    "statements": func_stmts,
                    "decision_points": func_decisions,
                    "loop_points": func_loops,
                    "cyclomatic_complexity": 1 + func_decisions + func_loops
                }
                result["functions"].append(func_info)

        result["total_statements"] = statement_count
        result["decision_points"] = total_decisions
        result["loop_points"] = total_loops
        result["cyclomatic_complexity"] = 1 + total_decisions + total_loops

        return result

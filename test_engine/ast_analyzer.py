import ast
from typing import Dict, List, Any, Optional

class AstAnalyzer:
    """
    Analyzes Python source code using the ast standard module.
    Extracts functions, arguments, decision points, loops, line numbers,
    calculates Cyclomatic Complexity, generates Control Flow Graphs (CFG),
    and derives linearly independent basis paths.
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

                args_list = [a.arg for a in node.args.args]
                docstring = ast.get_docstring(node) or "No docstring provided"
                end_lineno = getattr(node, 'end_lineno', node.lineno)
                complexity = 1 + func_decisions + func_loops

                # Generate Control Flow Graph (CFG) and Basis Paths
                cfg_data = AstAnalyzer._generate_cfg_and_paths(node)

                func_info = {
                    "name": node.name,
                    "args": args_list,
                    "start_line": node.lineno,
                    "end_line": end_lineno,
                    "docstring": docstring,
                    "statements": func_stmts,
                    "decision_points": func_decisions,
                    "loop_points": func_loops,
                    "cyclomatic_complexity": complexity,
                    "cfg_mermaid": cfg_data["mermaid"],
                    "basis_paths": cfg_data["basis_paths"],
                    "nodes_count": cfg_data["nodes_count"],
                    "edges_count": cfg_data["edges_count"]
                }
                result["functions"].append(func_info)

        result["total_statements"] = statement_count
        result["decision_points"] = total_decisions
        result["loop_points"] = total_loops
        result["cyclomatic_complexity"] = 1 + total_decisions + total_loops

        return result

    @staticmethod
    def _generate_cfg_and_paths(fn_node: ast.FunctionDef) -> Dict[str, Any]:
        """
        Derives Control Flow Graph (CFG) nodes, edges, Mermaid diagram, and Basis Paths.
        """
        fn_name = fn_node.name
        mermaid_lines = [
            "graph TD",
            f"  Start([Entry: {fn_name}()])"
        ]
        
        basis_paths = []
        nodes_count = 2 # Start and Exit
        edges_count = 0
        
        last_condition_node = "Start"
        decision_idx = 1
        
        # Walk statements in function body
        for stmt in fn_node.body:
            if isinstance(stmt, ast.If):
                nodes_count += 2 # decision node + body statement
                edges_count += 2
                d_id = f"D{decision_idx}"
                
                # Get expression string
                cond_str = AstAnalyzer._safe_unparse(stmt.test) or f"Condition {decision_idx}"
                cond_escaped = cond_str.replace('"', "'")
                
                mermaid_lines.append(f"  {d_id}{{{{{cond_escaped}}}}}")
                mermaid_lines.append(f"  {last_condition_node} --> {d_id}")
                
                # Action inside if body
                body_str = "Execute True Block"
                if stmt.body and isinstance(stmt.body[0], ast.Return):
                    ret_val = AstAnalyzer._safe_unparse(stmt.body[0].value) if stmt.body[0].value else "None"
                    body_str = f"Return {ret_val}".replace('"', "'")
                
                a_id = f"A{decision_idx}"
                mermaid_lines.append(f'  {a_id}["{body_str}"]')
                mermaid_lines.append(f"  {d_id} -- True --> {a_id}")
                mermaid_lines.append(f"  {a_id} --> Exit([Exit / Return])")
                
                basis_paths.append({
                    "path_id": f"Path {decision_idx}",
                    "description": f"Entry ➔ [{cond_str} == True] ➔ {body_str} ➔ Exit",
                    "condition": f"{cond_str} is True"
                })
                
                last_condition_node = f"{d_id} -- False"
                decision_idx += 1
                
                # Check for elif chains
                curr_elif = stmt.orelse
                while curr_elif and len(curr_elif) == 1 and isinstance(curr_elif[0], ast.If):
                    elif_stmt = curr_elif[0]
                    nodes_count += 2
                    edges_count += 2
                    d_id = f"D{decision_idx}"
                    cond_str = AstAnalyzer._safe_unparse(elif_stmt.test) or f"Condition {decision_idx}"
                    cond_escaped = cond_str.replace('"', "'")
                    
                    mermaid_lines.append(f"  {d_id}{{{{{cond_escaped}}}}}")
                    mermaid_lines.append(f"  {last_condition_node} --> {d_id}")
                    
                    body_str = "Execute True Block"
                    if elif_stmt.body and isinstance(elif_stmt.body[0], ast.Return):
                        ret_val = AstAnalyzer._safe_unparse(elif_stmt.body[0].value) if elif_stmt.body[0].value else "None"
                        body_str = f"Return {ret_val}".replace('"', "'")
                        
                    a_id = f"A{decision_idx}"
                    mermaid_lines.append(f'  {a_id}["{body_str}"]')
                    mermaid_lines.append(f"  {d_id} -- True --> {a_id}")
                    mermaid_lines.append(f"  {a_id} --> Exit([Exit / Return])")
                    
                    basis_paths.append({
                        "path_id": f"Path {decision_idx}",
                        "description": f"Entry ➔ [{cond_str} == True] ➔ {body_str} ➔ Exit",
                        "condition": f"{cond_str} is True"
                    })
                    
                    last_condition_node = f"{d_id} -- False"
                    decision_idx += 1
                    curr_elif = elif_stmt.orelse
                    
                # Final else block if present
                if curr_elif:
                    nodes_count += 1
                    edges_count += 2
                    else_str = "Execute Else Default"
                    if isinstance(curr_elif[0], ast.Return):
                        ret_val = AstAnalyzer._safe_unparse(curr_elif[0].value) if curr_elif[0].value else "None"
                        else_str = f"Return {ret_val}".replace('"', "'")
                    e_id = f"E_def_{decision_idx}"
                    mermaid_lines.append(f'  {e_id}["{else_str}"]')
                    mermaid_lines.append(f"  {last_condition_node} --> {e_id}")
                    mermaid_lines.append(f"  {e_id} --> Exit([Exit / Return])")
                    
                    basis_paths.append({
                        "path_id": f"Path {decision_idx} (Default)",
                        "description": f"Entry ➔ [All Conditions False] ➔ {else_str} ➔ Exit",
                        "condition": "All Conditions False"
                    })
                    last_condition_node = None

        if last_condition_node:
            mermaid_lines.append(f"  {last_condition_node} --> Exit([Exit / Return])")
            edges_count += 1
            if not any("Default" in p["path_id"] for p in basis_paths):
                basis_paths.append({
                    "path_id": f"Path {decision_idx} (Fall-through)",
                    "description": "Entry ➔ [Fall-through to normal return] ➔ Exit",
                    "condition": "Fall-through"
                })

        return {
            "mermaid": "\n".join(mermaid_lines),
            "basis_paths": basis_paths,
            "nodes_count": nodes_count,
            "edges_count": edges_count
        }

    @staticmethod
    def _safe_unparse(node: Optional[ast.AST]) -> str:
        if node is None:
            return ""
        try:
            return ast.unparse(node)
        except Exception:
            return ""

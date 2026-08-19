export const PYTHON_DEBUG_HELPERS = String.raw`
import functools as _kh_functools
import inspect as _kh_inspect
import pprint as _kh_pprint
import traceback as _kh_traceback

__all__ = [
    "khelp",
    "plocals",
    "pvars",
    "pstep",
    "pgrid",
    "pmatrix",
    "pdp",
    "pstack",
    "ptrace",
    "trace_recursion",
    "trace_tree",
    "trace_rescursion",
    "recursion_depth",
    "recursion_indent",
    "pindent",
    "preturn",
]

_KH_TRACE_DEPTH = 0
_KH_TREE_TRACE_STACK = []

_KH_HELP = {
    "khelp": {
        "summary": "List kata helpers or show detailed help for one helper.",
        "usage": "khelp() or khelp('pgrid') or khelp(pgrid)",
        "details": "Call without arguments to list helpers. Pass a helper name string or helper function to show usage and notes.",
    },
    "plocals": {
        "summary": "Pretty-print caller local variables.",
        "usage": "plocals(exclude=None, sort=True, compact=False)",
        "details": "Reads the caller frame. Use exclude={'self'} to hide noisy names. Use compact=True for one-line output.",
    },
    "pvars": {
        "summary": "Print selected variables from the caller scope.",
        "usage": "pvars('left', 'right', 'mid')",
        "details": "Looks in caller locals first, then globals. Missing names are printed as <missing>.",
    },
    "pstep": {
        "summary": "Print a labeled checkpoint.",
        "usage": "pstep('expand', row=r, col=c, value=grid[r][c])",
        "details": "Useful inside loops where plocals() would be too noisy. Keyword order is preserved.",
    },
    "pgrid": {
        "summary": "Pretty-print a grid or matrix.",
        "usage": "pgrid(grid, row_labels=True, col_labels=True, width=None)",
        "details": "Handles rectangular and ragged grids. Cell width is automatic unless width is provided.",
    },
    "pmatrix": {
        "summary": "Alias for pgrid().",
        "usage": "pmatrix(matrix, row_labels=True, col_labels=True, width=None)",
        "details": "Same behavior as pgrid().",
    },
    "pdp": {
        "summary": "Print 1D or 2D DP state.",
        "usage": "pdp(dp)",
        "details": "1D DP prints index/value pairs. 2D DP is formatted like a grid.",
    },
    "pstack": {
        "summary": "Print a compact stack trace.",
        "usage": "pstack(limit=8)",
        "details": "Shows function name and line number for the current call stack.",
    },
    "ptrace": {
        "summary": "Alias for pstack().",
        "usage": "ptrace(limit=8)",
        "details": "Same behavior as pstack().",
    },
    "trace_recursion": {
        "summary": "Decorator that prints recursive calls and returns.",
        "usage": "@trace_recursion\\ndef dfs(...): ...",
        "details": "Prints call arguments, return values, and indentation based on recursion depth.",
    },
    "trace_tree": {
        "summary": "Decorator for tracing binary-tree recursion.",
        "usage": "@trace_tree\\ndef dfs(node): ...",
        "details": "Prints recursive calls and returns like trace_recursion, and prefixes calls with L or R when the node argument is the current parent node's left or right child.",
    },
    "trace_rescursion": {
        "summary": "Alias for trace_recursion().",
        "usage": "@trace_rescursion\\ndef dfs(...): ...",
        "details": "Compatibility alias for the common misspelling. Prefer trace_recursion in new code.",
    },
    "recursion_depth": {
        "summary": "Return the current trace_recursion depth.",
        "usage": "recursion_depth(offset=0)",
        "details": "Inside a traced function body, returns the current call-frame depth. Use offset=1 for child-detail indentation.",
    },
    "recursion_indent": {
        "summary": "Return spaces for the current trace_recursion depth.",
        "usage": "recursion_indent(offset=0)",
        "details": "Useful for custom prints inside traced recursion. Defaults to the current call-frame indentation.",
    },
    "pindent": {
        "summary": "Print using the current recursion indentation.",
        "usage": "pindent('n=', n, sep='', offset=0)",
        "details": "Works like print(), but prefixes the current trace_recursion indentation. Keyword arguments are passed to print except offset.",
    },
    "preturn": {
        "summary": "Print and return a value.",
        "usage": "return preturn(value)",
        "details": "Useful inside recursive returns. The original value is returned unchanged.",
    },
}

def _kh_register_help(name, summary, usage, details):
    _KH_HELP[name] = {
        "summary": summary,
        "usage": usage,
        "details": details,
    }
    return None

def khelp(name=None):
    if name is None:
        width = max(len(key) for key in _KH_HELP)
        for key in sorted(_KH_HELP):
            print(f"{key.ljust(width)}  {_KH_HELP[key]['summary']}")
        return None

    if callable(name):
        key = getattr(name, "__name__", str(name))
    else:
        key = str(name)

    info = _KH_HELP.get(key)
    if info is None:
        print(f"No kata helper named {key!r}. Try khelp().")
        return None

    print(key)
    print(f"  {info['summary']}")
    print(f"  Usage: {info['usage']}")
    print(f"  {info['details']}")
    return None

def _kh_is_default_object_repr(text):
    return text.startswith("<") and " object at 0x" in text and text.endswith(">")

def _kh_repr(value, limit=120):
    try:
        text = repr(value)
    except Exception as exc:
        text = f"<repr failed: {type(exc).__name__}>"
    if _kh_is_default_object_repr(text) and hasattr(value, "val"):
        try:
            node_value = getattr(value, "val")
            text = f"{type(value).__name__}({node_value!r})"
        except Exception:
            pass
    if len(text) > limit:
        return text[: max(0, limit - 3)] + "..."
    return text

def _kh_caller_frame(depth=1):
    frame = _kh_inspect.currentframe()
    for _ in range(depth + 1):
        if frame is None:
            return None
        frame = frame.f_back
    return frame

def plocals(exclude=None, sort=True, compact=False):
    frame = _kh_caller_frame()
    if frame is None:
        print("<no caller frame>")
        return None
    excluded = set(exclude or ())
    values = {
        key: value
        for key, value in frame.f_locals.items()
        if key not in excluded and not key.startswith("_kh_")
    }
    items = values.items()
    if sort:
        items = sorted(items, key=lambda item: item[0])
    if compact:
        print(", ".join(f"{key}={_kh_repr(value)}" for key, value in items))
    else:
        print(_kh_pprint.pformat(dict(items), compact=True, width=100))
    return None

def pvars(*names):
    frame = _kh_caller_frame()
    if frame is None:
        print("<no caller frame>")
        return None
    pieces = []
    for name in names:
        if name in frame.f_locals:
            pieces.append(f"{name}={_kh_repr(frame.f_locals[name])}")
        elif name in frame.f_globals:
            pieces.append(f"{name}={_kh_repr(frame.f_globals[name])}")
        else:
            pieces.append(f"{name}=<missing>")
    print(", ".join(pieces))
    return None

def pstep(label="", **values):
    prefix = f"[{label}] " if label else ""
    body = ", ".join(f"{key}={_kh_repr(value)}" for key, value in values.items())
    print(prefix + body)
    return None

def _kh_rows(grid):
    try:
        rows = list(grid)
    except TypeError:
        rows = [[grid]]
    normalized = []
    for row in rows:
        if isinstance(row, (str, bytes)):
            normalized.append([row])
        else:
            try:
                normalized.append(list(row))
            except TypeError:
                normalized.append([row])
    return normalized

def pgrid(grid, row_labels=True, col_labels=True, width=None):
    rows = _kh_rows(grid)
    if not rows:
        print("<empty grid>")
        return None
    rendered = [[str(cell) for cell in row] for row in rows]
    max_cols = max((len(row) for row in rendered), default=0)
    if max_cols == 0:
        print("<empty rows>")
        return None
    cell_width = width or max(
        [1, len(str(max_cols - 1))]
        + [len(cell) for row in rendered for cell in row]
    )
    row_label_width = len(str(len(rendered) - 1))
    if col_labels:
        prefix = " " * (row_label_width + 3) if row_labels else ""
        print(prefix + " ".join(str(i).rjust(cell_width) for i in range(max_cols)))
    for i, row in enumerate(rendered):
        padded = row + [""] * (max_cols - len(row))
        prefix = f"{str(i).rjust(row_label_width)} | " if row_labels else ""
        print(prefix + " ".join(cell.rjust(cell_width) for cell in padded))
    return None

pmatrix = pgrid

def pdp(dp):
    rows = _kh_rows(dp)
    if rows and any(len(row) != 1 for row in rows):
        return pgrid(dp)
    try:
        values = list(dp)
    except TypeError:
        print(_kh_repr(dp))
        return None
    for i, value in enumerate(values):
        print(f"{i}: {_kh_repr(value)}")
    return None

def pstack(limit=8):
    stack = _kh_traceback.extract_stack(limit=limit + 2)[:-1]
    for frame in stack:
        print(f"{frame.name}:{frame.lineno}")
    return None

ptrace = pstack

def _kh_call_text(fn, args, kwargs):
    arg_text = ", ".join(
        [_kh_repr(arg, 60) for arg in args]
        + [f"{key}={_kh_repr(value, 60)}" for key, value in kwargs.items()]
    )
    return f"{fn.__name__}({arg_text})"

def trace_recursion(fn):
    @_kh_functools.wraps(fn)
    def wrapper(*args, **kwargs):
        global _KH_TRACE_DEPTH
        indent = "  " * _KH_TRACE_DEPTH
        call_text = _kh_call_text(fn, args, kwargs)
        print(f"{indent}{call_text}")
        _KH_TRACE_DEPTH += 1
        try:
            result = fn(*args, **kwargs)
        except BaseException as exc:
            _KH_TRACE_DEPTH -= 1
            print(f"{indent}{call_text} ! {type(exc).__name__}: {exc}")
            raise
        _KH_TRACE_DEPTH -= 1
        print(f"{indent}{call_text} -> {_kh_repr(result, 80)}")
        return result
    return wrapper

def _kh_tree_arg(args, kwargs):
    if "node" in kwargs:
        return kwargs["node"]
    for value in args:
        if value is None:
            return value
        if hasattr(value, "val") and (hasattr(value, "left") or hasattr(value, "right")):
            return value
    return args[0] if args else None

def _kh_tree_direction(parent, node):
    if parent is None or node is None:
        return ""
    try:
        if node is getattr(parent, "left", None):
            return "L "
        if node is getattr(parent, "right", None):
            return "R "
    except Exception:
        return ""
    return ""

def trace_tree(fn):
    @_kh_functools.wraps(fn)
    def wrapper(*args, **kwargs):
        global _KH_TRACE_DEPTH
        node = _kh_tree_arg(args, kwargs)
        parent = _KH_TREE_TRACE_STACK[-1] if _KH_TREE_TRACE_STACK else None
        direction = _kh_tree_direction(parent, node)
        indent = "  " * _KH_TRACE_DEPTH
        call_text = _kh_call_text(fn, args, kwargs)
        print(f"{indent}{direction}{call_text}")
        _KH_TRACE_DEPTH += 1
        _KH_TREE_TRACE_STACK.append(node)
        try:
            result = fn(*args, **kwargs)
        except BaseException as exc:
            _KH_TRACE_DEPTH -= 1
            _KH_TREE_TRACE_STACK.pop()
            print(f"{indent}{direction}{call_text} ! {type(exc).__name__}: {exc}")
            raise
        _KH_TRACE_DEPTH -= 1
        _KH_TREE_TRACE_STACK.pop()
        print(f"{indent}{direction}{call_text} -> {_kh_repr(result, 80)}")
        return result
    return wrapper

trace_rescursion = trace_recursion

def recursion_depth(offset=0):
    return max(0, _KH_TRACE_DEPTH - 1 + offset)

def recursion_indent(offset=0):
    return "  " * recursion_depth(offset)

def pindent(*values, offset=0, **kwargs):
    print(recursion_indent(offset), end="")
    print(*values, **kwargs)
    return None

def preturn(value):
    indent = "  " * max(0, _KH_TRACE_DEPTH)
    print(f"{indent}-> {_kh_repr(value, 100)}")
    return value
`;

export const PYTHON_BUILDER_HELPERS = String.raw`
from collections import deque as _kh_deque

__all__ = ["build_tree", "tree_to_list"]

def _kh_tree_node_class():
    Node = globals().get("TreeNode")
    if Node is not None:
        return Node

    class TreeNode:
        def __init__(self, val=0, left=None, right=None):
            self.val = val
            self.left = left
            self.right = right

        def __repr__(self):
            return f"TreeNode({self.val!r})"

    globals()["TreeNode"] = TreeNode
    return TreeNode

def build_tree(values):
    values = list(values)
    if not values:
        return None
    Node = _kh_tree_node_class()
    if values[0] is None:
        return None
    root = Node(values[0])
    queue = _kh_deque([root])
    i = 1
    while queue and i < len(values):
        node = queue.popleft()
        if i < len(values) and values[i] is not None:
            node.left = Node(values[i])
            queue.append(node.left)
        i += 1
        if i < len(values) and values[i] is not None:
            node.right = Node(values[i])
            queue.append(node.right)
        i += 1
    return root

def tree_to_list(root):
    if root is None:
        return []
    out = []
    queue = _kh_deque([root])
    seen = set()
    while queue:
        node = queue.popleft()
        if node is None:
            out.append(None)
            continue
        marker = id(node)
        if marker in seen:
            out.append("<cycle>")
            continue
        seen.add(marker)
        out.append(getattr(node, "val", None))
        queue.append(getattr(node, "left", None))
        queue.append(getattr(node, "right", None))
    while out and out[-1] is None:
        out.pop()
    return out
`;

function pythonHelperBootstrap(includeBuilders: boolean): string {
  const builderSource = includeBuilders
    ? `\n__kh_builder_source = ${JSON.stringify(PYTHON_BUILDER_HELPERS)}`
    : "";
  const builderExport = includeBuilders
    ? `
    if __include_builders:
        __builder_mod = __kh_install_helper_module("kata_builder_helpers", __kh_builder_source)
        for __name in getattr(__builder_mod, "__all__", ()):
            __target[__name] = getattr(__builder_mod, __name)
        __debug_mod._kh_register_help(
            "build_tree",
            "REPL only: build a binary tree from level-order values.",
            "root = build_tree([3, 9, 20, None, None, 15, 7])",
            "Available in the REPL only. Uses the active TreeNode class if one exists, otherwise creates a compatible class.",
        )
        __debug_mod._kh_register_help(
            "tree_to_list",
            "REPL only: convert a binary tree to level-order values.",
            "tree_to_list(root)",
            "Available in the REPL only. Trims trailing None values and guards against cycles.",
        )
`
    : "";

  return `
import sys as __kh_sys
import types as __kh_types

__kh_debug_source = ${JSON.stringify(PYTHON_DEBUG_HELPERS)}${builderSource}

def __kh_install_helper_module(__name, __source):
    __mod = __kh_types.ModuleType(__name)
    exec(__source, __mod.__dict__)
    __kh_sys.modules[__name] = __mod
    return __mod

def __kh_export_helpers(__target, __include_builders=False):
    __debug_mod = __kh_install_helper_module("kata_debug_helpers", __kh_debug_source)
    for __name in getattr(__debug_mod, "__all__", ()):
        __target[__name] = getattr(__debug_mod, __name)
${builderExport}

__kh_export_helpers(globals(), ${includeBuilders ? "True" : "False"})
`;
}

export const PYTHON_TEST_HELPER_BOOTSTRAP = pythonHelperBootstrap(false);
export const PYTHON_REPL_HELPER_BOOTSTRAP = pythonHelperBootstrap(true);

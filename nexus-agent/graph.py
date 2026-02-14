"""LangGraph wiring: nodes, edges, conditional gates, and compilation."""

from langgraph.graph import StateGraph, END

from state import AgentState
from nodes.game_planner import game_planner_node
from nodes.design_evaluator import design_evaluator_node
from nodes.game_coder import game_coder_node
from nodes.implementation_planner import implementation_planner_node
from nodes.game_player import game_player_node


# ── Conditional edge: Design gate ──
def design_gate(state: AgentState) -> str:
    """Route after design evaluation: approve → coder, or loop back to planner."""
    if state["design_approved"]:
        return "implementation_planner"
    if state["design_iteration"] >= 3:
        print("Warning: Max design iterations reached, proceeding with best effort")
        return "implementation_planner"
    return "game_planner"


# ── Conditional edge: Ship gate ──
def ship_gate(state: AgentState) -> str:
    """Route after playtesting: approve → done, or loop back to coder for fixes."""
    if state["ship_approved"]:
        return END
    if state["code_iteration"] >= 2:
        print("Warning: Max code iterations reached, shipping best effort")
        return END
    return "game_coder"


def build_graph():
    """Construct and compile the multi-agent LangGraph pipeline."""
    workflow = StateGraph(AgentState)

    # ── Add nodes ──
    workflow.add_node("game_planner", game_planner_node)
    workflow.add_node("design_evaluator", design_evaluator_node)
    workflow.add_node("implementation_planner", implementation_planner_node)
    
    workflow.add_node("game_coder", game_coder_node)
    workflow.add_node("game_player", game_player_node)

    # ── Set entry point ──
    workflow.set_entry_point("game_planner")

    # ── Linear edges ──
    workflow.add_edge("game_planner", "design_evaluator")
    workflow.add_edge("implementation_planner", "game_coder")
    workflow.add_edge("game_coder", "game_player")

    # ── Conditional edges ──
    workflow.add_conditional_edges("design_evaluator", design_gate)
    workflow.add_conditional_edges("game_player", ship_gate)

    return workflow.compile()

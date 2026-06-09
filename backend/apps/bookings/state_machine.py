"""Booking state machine — transition rules và validation."""
from dataclasses import dataclass


class InvalidTransitionError(Exception):
    """Raised khi booking cố chuyển trạng thái không hợp lệ."""
    pass


@dataclass(frozen=True)
class Transition:
    action: str
    actor_role: str  # 'customer', 'therapist', 'admin'
    from_status: str
    to_status: str


# Định nghĩa tất cả transition hợp lệ
VALID_TRANSITIONS: list = [
    # Pending → confirmed (therapist confirm)
    Transition("confirm", "therapist", "pending", "confirmed"),
    # Pending → rejected (therapist reject)
    Transition("reject", "therapist", "pending", "rejected"),
    # Pending → cancelled (customer cancel)
    Transition("cancel", "customer", "pending", "cancelled"),
    # Confirmed → in_progress (therapist start)
    Transition("start", "therapist", "confirmed", "in_progress"),
    # Confirmed → cancelled (customer hoặc admin cancel)
    Transition("cancel", "customer", "confirmed", "cancelled"),
    Transition("cancel", "admin", "confirmed", "cancelled"),
    # In_progress → completed (therapist complete)
    Transition("complete", "therapist", "in_progress", "completed"),
    # In_progress → cancelled (admin only)
    Transition("cancel", "admin", "in_progress", "cancelled"),
    # Force cancel — admin hủy booking bất kỳ trạng thái nào (pending/confirmed/in_progress)
    Transition("force_cancel", "admin", "pending", "cancelled"),
    Transition("force_cancel", "admin", "confirmed", "cancelled"),
    Transition("force_cancel", "admin", "in_progress", "cancelled"),
]

# Terminal states — không thể chuyển đi đâu nữa
TERMINAL_STATES = {"completed", "rejected", "cancelled"}


def validate_transition(
    action: str,
    actor_role: str,
    current_status: str,
) -> str:
    """Validate và trả về next status hoặc raise InvalidTransitionError."""
    if current_status in TERMINAL_STATES:
        raise InvalidTransitionError(
            f"Booking đã ở trạng thái cuối '{current_status}', không thể {action}"
        )

    for t in VALID_TRANSITIONS:
        if (
            t.action == action
            and t.actor_role == actor_role
            and t.from_status == current_status
        ):
            return t.to_status

    raise InvalidTransitionError(
        f"Không thể {action} từ trạng thái '{current_status}' với role '{actor_role}'"
    )


def is_terminal(status: str) -> bool:
    return status in TERMINAL_STATES

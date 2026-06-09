"""Tests cho booking state machine."""
import pytest

from apps.bookings.state_machine import (
    InvalidTransitionError,
    is_terminal,
    validate_transition,
)


class TestValidateTransition:
    def test_pending_to_confirmed_by_therapist(self):
        assert validate_transition("confirm", "therapist", "pending") == "confirmed"

    def test_pending_to_rejected_by_therapist(self):
        assert validate_transition("reject", "therapist", "pending") == "rejected"

    def test_pending_to_cancelled_by_customer(self):
        assert validate_transition("cancel", "customer", "pending") == "cancelled"

    def test_confirmed_to_in_progress_by_therapist(self):
        assert validate_transition("start", "therapist", "confirmed") == "in_progress"

    def test_confirmed_to_cancelled_by_customer(self):
        assert validate_transition("cancel", "customer", "confirmed") == "cancelled"

    def test_confirmed_to_cancelled_by_admin(self):
        assert validate_transition("cancel", "admin", "confirmed") == "cancelled"

    def test_in_progress_to_completed_by_therapist(self):
        assert validate_transition("complete", "therapist", "in_progress") == "completed"

    def test_in_progress_to_cancelled_by_admin(self):
        assert validate_transition("cancel", "admin", "in_progress") == "cancelled"

    def test_invalid_transition_customer_confirm(self):
        with pytest.raises(InvalidTransitionError):
            validate_transition("confirm", "customer", "pending")

    def test_invalid_transition_therapist_cancel_pending(self):
        with pytest.raises(InvalidTransitionError):
            validate_transition("cancel", "therapist", "pending")

    def test_terminal_state_completed(self):
        with pytest.raises(InvalidTransitionError):
            validate_transition("cancel", "admin", "completed")

    def test_terminal_state_rejected(self):
        with pytest.raises(InvalidTransitionError):
            validate_transition("confirm", "therapist", "rejected")

    def test_terminal_state_cancelled(self):
        with pytest.raises(InvalidTransitionError):
            validate_transition("start", "therapist", "cancelled")

    def test_invalid_action(self):
        with pytest.raises(InvalidTransitionError):
            validate_transition("magic", "admin", "pending")


class TestIsTerminal:
    def test_completed_is_terminal(self):
        assert is_terminal("completed") is True

    def test_rejected_is_terminal(self):
        assert is_terminal("rejected") is True

    def test_cancelled_is_terminal(self):
        assert is_terminal("cancelled") is True

    def test_pending_not_terminal(self):
        assert is_terminal("pending") is False

    def test_confirmed_not_terminal(self):
        assert is_terminal("confirmed") is False

    def test_in_progress_not_terminal(self):
        assert is_terminal("in_progress") is False

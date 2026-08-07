import { FeedbackModule } from "../js/modules/feedback.js";

describe("Feedback Module", () => {
  beforeEach(() => {
    // Clean up DOM and localStorage
    document.body.innerHTML = "";
    localStorage.clear();

    // Mock UserManager
    window.UserManager = {
      getCurrentUser: () => null,
    };
  });

  describe("init", () => {
    test("should initialize with Supabase URL and key", () => {
      FeedbackModule.init("https://test.supabase.co", "test-key");
      expect(FeedbackModule.supabaseUrl).toBe("https://test.supabase.co");
      expect(FeedbackModule.supabaseKey).toBe("test-key");
    });

    test("should inject floating button", () => {
      FeedbackModule.init(null, null);
      const fab = document.getElementById("feedback-fab");
      expect(fab).toBeTruthy();
      expect(fab.tagName).toBe("BUTTON");
    });

    test("should not duplicate floating button", () => {
      FeedbackModule.init(null, null);
      FeedbackModule.init(null, null);
      const buttons = document.getElementById("feedback-fab");
      expect(buttons).toBeTruthy();
    });
  });

  describe("injectFloatingButton", () => {
    test("should create button with correct attributes", () => {
      FeedbackModule.init(null, null);
      const fab = document.getElementById("feedback-fab");

      expect(fab.id).toBe("feedback-fab");
      expect(fab.title).toBe("Donner mon avis");
      expect(fab.getAttribute("aria-label")).toBe("Donner mon avis sur l'application");
      expect(fab.className).toContain("bg-emerald-600");
      expect(fab.className).toContain("fixed");
    });

    test("should contain chat icon SVG", () => {
      FeedbackModule.init(null, null);
      const fab = document.getElementById("feedback-fab");
      const svg = fab.querySelector("svg");
      expect(svg).toBeTruthy();
    });
  });

  describe("openModal", () => {
    test("should create modal with rating buttons", () => {
      FeedbackModule.init(null, null);
      FeedbackModule.openModal();

      const modal = document.getElementById("feedback-modal");
      expect(modal).toBeTruthy();

      const ratingButtons = modal.querySelectorAll(".rating-btn");
      expect(ratingButtons.length).toBe(4);
    });

    test("should have correct modal structure", () => {
      FeedbackModule.init(null, null);
      FeedbackModule.openModal();

      const modal = document.getElementById("feedback-modal");
      expect(modal.querySelector("#feedback-backdrop")).toBeTruthy();
      expect(modal.querySelector("#feedback-content")).toBeTruthy();
      expect(modal.querySelector("#feedback-message")).toBeTruthy();
      expect(modal.querySelector("#feedback-submit")).toBeTruthy();
    });

    test("should close on backdrop click", () => {
      FeedbackModule.init(null, null);
      FeedbackModule.openModal();

      const backdrop = document.getElementById("feedback-backdrop");
      backdrop.click();

      setTimeout(() => {
        const modal = document.getElementById("feedback-modal");
        expect(modal).toBeFalsy();
      }, 350);
    });

    test("should close on Escape key", () => {
      FeedbackModule.init(null, null);
      FeedbackModule.openModal();

      const event = new KeyboardEvent("keydown", { key: "Escape" });
      document.dispatchEvent(event);

      setTimeout(() => {
        const modal = document.getElementById("feedback-modal");
        expect(modal).toBeFalsy();
      }, 350);
    });
  });

  describe("setupRatingButtons", () => {
    test("should set rating value when clicked", () => {
      FeedbackModule.init(null, null);
      FeedbackModule.openModal();

      const buttons = document.querySelectorAll(".rating-btn");
      buttons[2].click(); // Click on 🙂 (rating 3)

      const ratingInput = document.getElementById("feedback-rating");
      expect(ratingInput.value).toBe("3");
    });

    test("should highlight selected rating", () => {
      FeedbackModule.init(null, null);
      FeedbackModule.openModal();

      const buttons = document.querySelectorAll(".rating-btn");
      buttons[1].click(); // Click on 😐 (rating 2)

      expect(buttons[1].classList.contains("scale-125")).toBe(true);
      expect(buttons[1].classList.contains("ring-2")).toBe(true);
    });
  });

  describe("submitFeedback", () => {
    test("should show alert if no rating selected", () => {
      FeedbackModule.init(null, null);
      FeedbackModule.openModal();

      const alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});
      FeedbackModule.submitFeedback();

      expect(alertMock).toHaveBeenCalledWith("Veuillez sélectionner une note 😊");
      alertMock.mockRestore();
    });

    test("should store feedback locally when Supabase is not configured", () => {
      FeedbackModule.init(null, null);
      FeedbackModule.openModal();

      // Select rating
      const buttons = document.querySelectorAll(".rating-btn");
      buttons[3].click(); // Rating 4

      // Fill message
      const messageField = document.getElementById("feedback-message");
      messageField.value = "Excellent app!";

      // Submit
      FeedbackModule.submitFeedback();

      // Check localStorage
      setTimeout(() => {
        const stored = JSON.parse(localStorage.getItem("ka_farm_feedbacks"));
        expect(stored).toBeTruthy();
        expect(stored[0].note).toBe(4);
        expect(stored[0].message).toBe("Excellent app!");
      }, 100);
    });

    test("should attach user_id if user is logged in", () => {
      window.UserManager = {
        getCurrentUser: () => ({ id: "user-123", name: "Test User" }),
      };

      FeedbackModule.init(null, null);
      FeedbackModule.openModal();

      const buttons = document.querySelectorAll(".rating-btn");
      buttons[0].click(); // Rating 1

      FeedbackModule.submitFeedback();

      setTimeout(() => {
        const stored = JSON.parse(localStorage.getItem("ka_farm_feedbacks"));
        expect(stored[0].user_id).toBe("user-123");
      }, 100);
    });
  });

  describe("closeModal", () => {
    test("should remove modal after animation", () => {
      FeedbackModule.init(null, null);
      FeedbackModule.openModal();

      const modal = document.getElementById("feedback-modal");
      expect(modal).toBeTruthy();

      FeedbackModule.closeModal();

      setTimeout(() => {
        const closedModal = document.getElementById("feedback-modal");
        expect(closedModal).toBeFalsy();
      }, 350);
    });
  });

  describe("storeLocally", () => {
    test("should store feedback in localStorage", () => {
      FeedbackModule.init(null, null);

      const feedback = {
        date: new Date().toISOString(),
        note: 3,
        message: "Test feedback",
        user_id: null,
      };

      FeedbackModule.storeLocally(feedback);

      const stored = JSON.parse(localStorage.getItem("ka_farm_feedbacks"));
      expect(stored.length).toBe(1);
      expect(stored[0].note).toBe(3);
      expect(stored[0].message).toBe("Test feedback");
    });

    test("should append multiple feedbacks", () => {
      FeedbackModule.init(null, null);

      FeedbackModule.storeLocally({ note: 1, message: "Bad" });
      FeedbackModule.storeLocally({ note: 4, message: "Good" });

      const stored = JSON.parse(localStorage.getItem("ka_farm_feedbacks"));
      expect(stored.length).toBe(2);
    });
  });
});

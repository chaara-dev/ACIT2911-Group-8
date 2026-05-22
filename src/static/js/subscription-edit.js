import { resetSubscriptionDialog } from "./shared.js";

const displayError = (errorMessage) => {
  document.querySelector(".save-edits-error")?.remove();

  const subscribedDateField = document.querySelector(".sub-logo");

  const error = document.createElement("p");
  error.textContent = errorMessage;
  error.classList.add("save-edits-error");
  subscribedDateField.after(error);
};
// Set date input limits
const setDateInputLimits = () => {
  const dateInput = document.getElementById("subRenewalDateInput");
  const today = new Date();
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  dateInput.min = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  dateInput.max = `${nextYear.getFullYear()}-${String(nextYear.getMonth() + 1).padStart(2, "0")}-${String(nextYear.getDate()).padStart(2, "0")}`;
};

const checkRenewalDateValid = (subPeriod, renewalDate) => {
  const dateInput = document.getElementById("subRenewalDateInput");

  // Validate renewal date is within limit
  const maxDate = new Date();
  if (subPeriod === "Monthly") {
    maxDate.setMonth(maxDate.getMonth() + 1);
  } else if (subPeriod === "Yearly") {
    maxDate.setFullYear(maxDate.getFullYear() + 1);
  }
  const maxDateString = `${maxDate.getFullYear()}-${String(maxDate.getMonth() + 1).padStart(2, "0")}-${String(maxDate.getDate()).padStart(2, "0")}`;

  if (renewalDate > maxDateString) {
    dateInput.value = "";
    if (subPeriod === "Monthly") {
      displayError("Renewal date must be within a month from today.");
      return false;
    } else {
      displayError("Renewal date must be within a year from today.");
      return false;
    }
  }
  return true;
};

const saveEdits = async (name, cost, billing_type, renewal_date, subId) => {
  const edits = {
    name: name,
    cost: cost,
    billing_type: billing_type,
    renewal_date: renewal_date,
  };

  const res = await fetch(`/api/subscriptions/${subId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(edits),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error);
  }

  return data;
};

const setEditMode = () => {
  document.getElementById("subPrice").hidden = true;
  document.querySelector(".sub-total-paid").hidden = true;
  document.getElementById("subPeriod").hidden = true;
  document.querySelector(".sub-payments").hidden = true;
  document.getElementById("subRenewalDate").hidden = true;
  document.getElementById("subscribedOn").hidden = true;
  document.getElementById("editSubButtonDiv").hidden = true;
  document.getElementById("deleteSubButtonDiv").hidden = true;

  document.getElementById("subNameEdit").hidden = false;
  document.getElementById("subPriceEdit").hidden = false;
  document.getElementById("subPeriodEdit").hidden = false;
  document.getElementById("subRenewalDateEdit").hidden = false;
  document.getElementById("subscribedOnDateEdit").hidden = false;
  document.getElementById("saveEditButtonDiv").hidden = false;
  document.getElementById("cancelEditButtonDiv").hidden = false;
};

export const displayEditSubscription = (sub) => {
  setEditMode();

  const saveButton = document.getElementById("saveEditButton");
  const cancelButton = document.getElementById("cancelEditButton");

  const nameValue = document.getElementById("subNameEditInput");
  const priceValue = document.getElementById("subPriceEditInput");
  const periodValue = document.getElementById("subPeriodEditInput");
  const renewalDateValue = document.getElementById("subRenewalDateInput");

  // Pre-fill the form with the current data
  nameValue.value = sub.name;
  priceValue.value = sub.cost;
  periodValue.value = sub.billing_type;
  renewalDateValue.value = sub.renewal_date.slice(0, 10);

  setDateInputLimits();

  saveButton.addEventListener("click", async () => {
    if (
      !nameValue.value ||
      !priceValue.value ||
      !periodValue.value ||
      !renewalDateValue.value
    ) {
      return displayError("All fields must be entered.");
    }

    if (parseFloat(priceValue.value) < 0) {
      return displayError("Price cannot be less than $0.");
    }

    if (!checkRenewalDateValid(periodValue.value, renewalDateValue.value)) {
      return;
    }

    await saveEdits(
      nameValue.value,
      parseFloat(priceValue.value),
      periodValue.value,
      renewalDateValue.value,
      sub.id,
    );
    window.location.href = `/`;
  });

  cancelButton.addEventListener(
    "click",
    () => {
      document.querySelector(".save-edits-error")?.remove();
      resetSubscriptionDialog();
    },
    { once: true },
  );
};

import { resetSubscriptionDialog } from "./shared.js";

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

  saveButton.addEventListener(
    "click",
    async () => {
      await saveEdits(
        nameValue.value,
        parseFloat(priceValue.value),
        periodValue.value,
        renewalDateValue.value,
        sub.id,
      );
      window.location.href = `/`;
    },
    { once: true },
  );

  cancelButton.addEventListener(
    "click",
    () => {
      resetSubscriptionDialog();
    },
    { once: true },
  );
};

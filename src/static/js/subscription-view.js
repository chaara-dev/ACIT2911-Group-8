import { displayEditSubscription } from "./subscription-edit";

const getSubscriptionsList = async () => {
  const res = await fetch(`/static/data/subscription_services.json`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error("Could not getch subscription_services.json");
  }

  return data;
};

const getSubscriptionLogo = (sub, subsList) => {
  const DEFAULT_LOGO = "/static/images/default-no-logo-subscription.png";
  const subMatch = subsList.find((item) => item.name === sub.name);
  return subMatch?.logo ?? DEFAULT_LOGO;
};

const getTotalPaid = (sub) =>
  sub.payments.reduce((total, payment) => total + payment.amount, 0);

const fillSubscriptionInfo = (sub, logo, totalPaid, formattedDate) => {
  document.getElementById("subName").textContent = sub.name;
  document.getElementById("subLogo").src = logo;
  document.getElementById("subPrice").textContent = `Price: $${sub.cost}`;
  document.getElementById("subTotalPaid").textContent =
    `Total Paid: $${totalPaid}`;
  document.getElementById("subPeriod").textContent =
    `Billing type: ${sub.billing_type}`;
  document.getElementById("subRenewalDate").textContent =
    `Renewal date: ${formattedDate}`;
};

const displayPaymentTable = (sub) => {
  // const paymentTable = document.getElementById("paymentsBody");
  // while (paymentTable.rows.length > 1) {
  //   paymentTable.deleteRow(1);
  // }
  // const payments = sub.payments;
  // payments.forEach((payment) => {
  //   const row = document.createElement("tr");
  //   row.classList.add("table-row");
  //   const paid = document.createElement("td");
  //   paid.textContent = payment.amount;
  //   row.appendChild(paid);
  //   const datePaid = document.createElement("td");
  //   datePaid.textContent = payment.date_paid;
  //   row.appendChild(datePaid);
  //   paymentTable.appendChild(row);
  // });
};

const resetDialog = () => {
  document.getElementById("subNameEdit").hidden = true;
  document.getElementById("subPriceEdit").hidden = true;
  document.getElementById("subPeriodEdit").hidden = true;
  document.getElementById("subRenewalDateEdit").hidden = true;
  document.getElementById("subscribedOnDateEdit").hidden = true;
  document.getElementById("saveEditButtonDiv").hidden = true;
  document.getElementById("cancelEditButtonDiv").hidden = true;

  document.getElementById("subPrice").hidden = false;
  document.getElementById("subPeriod").hidden = false;
  document.getElementById("subRenewalDate").hidden = false;
  document.getElementById("subscribedOn").hidden = false;
  document.getElementById("editSubButtonDiv").hidden = false;
  document.querySelector(".sub-total-paid").hidden = false;
  document.querySelector(".sub-payments").hidden = false;
};

export const displaySubscription = async (subId) => {
  const viewPage = document.getElementById("viewSubscription");
  const closeButton = document.getElementById("closeSubButton");
  const editButton = document.getElementById("editSubButton");

  const subsList = await getSubscriptionsList();

  const res = await fetch(`/api/subscriptions/${subId}`);
  const sub = await res.json();

  const logo = getSubscriptionLogo(sub, subsList);
  const totalPaid = getTotalPaid(sub);
  const formattedDate = new Date(sub.renewal_date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  fillSubscriptionInfo(sub, logo, totalPaid, formattedDate);
  displayPaymentTable(sub);

  viewPage.showModal();

  editButton.addEventListener("click", () => {
    displayEditSubscription(sub);
  });

  closeButton.addEventListener("click", () => {
    resetDialog();
    viewPage.close();
  });
};

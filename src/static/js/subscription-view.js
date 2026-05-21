import { displayEditSubscription } from "./subscription-edit";

const resetDialog = () => {
  document.getElementById("subNameEdit").hidden = true;
  document.getElementById("subPrice").hidden = false;
  document.getElementById("subPriceEdit").hidden = true;
  document.getElementById("subPeriod").hidden = false;
  document.getElementById("subPeriodEdit").hidden = true;
  document.getElementById("subRenewalDate").hidden = false;
  document.getElementById("subRenewalDateEdit").hidden = true;
  document.getElementById("subscribedOn").hidden = false;
  document.getElementById("subscribedOnDateEdit").hidden = true;
  document.getElementById("editSubButtonDiv").hidden = false;
  document.getElementById("saveEditButtonDiv").hidden = true;
  document.getElementById("cancelEditButtonDiv").hidden = true;
  document.querySelector(".sub-total-paid").hidden = false;
  document.querySelector(".sub-payments").hidden = false;
};

export const displaySubscription = async (subId) => {
  const viewPage = document.getElementById("viewSubscription");
  const closeButton = document.getElementById("closeSubButton");
  const editButton = document.getElementById("editSubButton");

  const listRes = await fetch(`/static/data/subscription_services.json`);
  const subsList = await listRes.json();

  const subRes = await fetch(`/api/subscriptions/${subId}`);
  const sub = await subRes.json();

  // Get sub logo picture
  const subMatch = subsList.find((item) => item.name === sub.name);
  const logo = subMatch
    ? subMatch.logo
    : "https://i.ibb.co/8DDDJ5y4/3674270-200.png";

  const totalPaid = sub.payments.reduce(
    (total, payment) => total + payment.amount,
    0,
  );

  // Format date as ("day" "month" "year")
  const formattedDate = new Date(sub.renewal_date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  document.getElementById("subName").textContent = sub.name;
  document.getElementById("subLogo").src = logo;
  document.getElementById("subPrice").textContent = `Price: $${sub.cost}`;
  document.getElementById("subTotalPaid").textContent =
    `Total Paid: $${totalPaid}`;
  document.getElementById("subPeriod").textContent =
    `Billing type: ${sub.billing_type}`;
  document.getElementById("subRenewalDate").textContent =
    `Renewal date: ${formattedDate}`;

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

  viewPage.showModal();

  editButton.addEventListener("click", () => {
    displayEditSubscription(sub);
  });

  closeButton.addEventListener("click", () => {
    resetDialog();
    viewPage.close();
  });
};

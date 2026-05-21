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

  const displayEditSubscription = () => {
    const editButton = document.getElementById("editSubButton");
    editButton.addEventListener(
      "click",
      () => {
        document.querySelector(".sub-total-paid").hidden = true;
        document.querySelector(".sub-payments").hidden = true;

        document.getElementById("subNameEdit").hidden = false;
        const nameValue = document.getElementById("subNameEditInput");
        nameValue.value = sub.name;

        document.getElementById("subPrice").hidden = true;
        document.getElementById("subPriceEdit").hidden = false;
        const priceValue = document.getElementById("subPriceEditInput");
        priceValue.value = sub.cost;

        document.getElementById("subPeriod").hidden = true;
        document.getElementById("subPeriodEdit").hidden = false;
        const periodValue = document.getElementById("subPeriodEditInput");
        periodValue.value = sub.billing_type;

        document.getElementById("subRenewalDate").hidden = true;
        document.getElementById("subRenewalDateEdit").hidden = false;
        const renewalDateValue = document.getElementById("subRenewalDateInput");
        renewalDateValue.value = sub.renewal_date.slice(0, 10);

        document.getElementById("subscribedOn").hidden = true;
        document.getElementById("subscribedOnDateEdit").hidden = false;

        document.getElementById("editSubButtonDiv").hidden = true;
        document.getElementById("saveEditButtonDiv").hidden = false;
        const saveButton = document.getElementById("saveEditButton");
        document.getElementById("cancelEditButtonDiv").hidden = false;
        const cancelButton = document.getElementById("cancelEditButton");

        saveButton.addEventListener(
          "click",
          async () => {
            const edits = {
              name: nameValue.name,
              cost: priceValue.value,
              billing_type: periodValue.value,
              renewal_date: renewalDateValue.value,
            };
            const res = await fetch(`/api/subscriptions/${subId}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(edits),
            });
            window.location.href = `/`;
          },
          { once: true },
        );

        cancelButton.addEventListener(
          "click",
          () => {
            resetDialog();
            displayEditSubscription();
          },
          { once: true },
        );
      },
      { once: true },
    );
  };
  displayEditSubscription();

  closeButton.addEventListener("click", () => {
    resetDialog();
    viewPage.close();
  });
};

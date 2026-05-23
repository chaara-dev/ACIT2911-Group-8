import { addLogoutListener, calculateRenewalDays } from "./shared.js";
import { displaySubscription } from "./subscription-view.js";

const getSubscriptions = async () => {
  try {
    const res = await fetch("/api/subscriptions");
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error);
    }

    return data.subscriptions;
  } catch (error) {
    console.log(error);
  }
};

const calculateNextRenewal = (subs) => {
  if (subs.length === 0) {
    return "N/A";
  }
  const subsSorted = subs
    .slice()
    .sort((a, b) => new Date(a.renewal_date) - new Date(b.renewal_date));
  return subsSorted[0];
};

const calculateTotalCost = (subs, billing_type) => {
  let total = 0;
  for (const sub of subs) {
    if (sub["billing_type"] === billing_type) {
      total += sub["cost"];
    }
  }
  return total.toFixed(2);
};

const filterSubscriptions = (subs, billing_type) => {
  if (!billing_type) return subs;
  return subs.filter((sub) => sub.billing_type === billing_type);
};

const sortSubscriptionsByPrice = (subs, direction) => {
  if (direction == "desc") {
    return subs.sort((a, b) => b.cost - a.cost);
  } else if (direction == "asc") {
    return subs.sort((a, b) => a.cost - b.cost);
  }
};

const sortSubscriptionsByRenewalDate = (subs, direction) => {
  if (direction === "asc") {
    return subs.sort(
      (a, b) => new Date(a.renewal_date) - new Date(b.renewal_date),
    );
  } else if (direction === "desc") {
    return subs.sort(
      (a, b) => new Date(b.renewal_date) - new Date(a.renewal_date),
    );
  }
};

const sortSubscriptionsAlpha = (subs, direction) => {
  if (direction === "asc") {
    return subs.sort((a, b) => a.name.localeCompare(b.name));
  } else if (direction === "desc") {
    return subs.sort((a, b) => b.name.localeCompare(a.name));
  }
};

export const updateSubscriptionCard = (updatedSub) => {
  const oldSub = allSubscriptions.findIndex((sub) => sub.id === updatedSub.id);
  allSubscriptions[oldSub] = updatedSub;
};

const searchSubscriptions = (subs, search) => {
  if (!search) return subs;
  const needle = search.toLowerCase();
  return subs.filter((sub) => String(sub.name).toLowerCase().includes(needle));
};

const displayDashboard = (subs) => {
  const activeSubsValue = document.getElementById("active-sub");
  const nextRenewalValue = document.getElementById("next-renew");
  const nextRenewalSubName = document.getElementById("next-renew-name");
  const totalCostValue = document.getElementById("total-price");

  activeSubsValue.textContent = subs.length;
  const nextRenewal = calculateNextRenewal(subs);
  nextRenewalValue.textContent = calculateRenewalDays(nextRenewal.renewal_date);
  nextRenewalSubName.textContent =
    subs.length > 0 ? `[${nextRenewal.name}]` : "";
};

const displaySubscriptions = (subs) => {
  const subCards = document.querySelector(".cards");
  subCards.replaceChildren();

  subs.forEach((sub) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.id = sub.id;

    const cost = document.createElement("span");
    const name = document.createElement("span");
    const renewal = document.createElement("span");

    const renewalDays = calculateRenewalDays(sub.renewal_date);

    cost.textContent = `$${sub.cost.toLocaleString("en-US")}`;
    name.textContent = sub.name;
    renewal.textContent = `${renewalDays} days`;

    const nameWrapper = document.createElement("div");
    nameWrapper.classList.add("sub-name-wrapper");
    nameWrapper.appendChild(name);

    if (sub.billing_type === "Yearly") {
      const yearlyTag = document.createElement("span");
      yearlyTag.classList.add("yearly-tag");
      yearlyTag.textContent = "[Yearly]";
      nameWrapper.appendChild(yearlyTag);
    }

    card.appendChild(cost);
    card.appendChild(nameWrapper);
    card.appendChild(renewal);

    card.addEventListener("click", async () => {
      await displaySubscription(sub.id);
    });

    subCards.appendChild(card);
  });
};

let allSubscriptions = [];
let activeSearch = "";
let activeBillingFilter = "";
let activeSort = "";
let activeSortDirection = "";

export const applySubscriptionView = () => {
  let shown = allSubscriptions.slice();
  shown = searchSubscriptions(shown, activeSearch);
  shown = filterSubscriptions(shown, activeBillingFilter);

  // Default sort
  shown = sortSubscriptionsByRenewalDate(shown, "asc");

  if (activeSort === "price") {
    shown = sortSubscriptionsByPrice(shown, activeSortDirection);
  } else if (activeSort === "date") {
    shown = sortSubscriptionsByRenewalDate(shown, activeSortDirection);
  } else if (activeSort === "name") {
    shown = sortSubscriptionsAlpha(shown, activeSortDirection);
  }

  const totalCalculationTitle = document.getElementById(
    "periodTypeCalculationTitle",
  );
  const totalPrice = document.getElementById("total-price");

  if (activeBillingFilter === "Yearly") {
    totalCalculationTitle.textContent = "Yearly Total";
    totalPrice.textContent = calculateTotalCost(allSubscriptions, "Yearly");
  } else {
    totalCalculationTitle.textContent = "Monthly Total";
    totalPrice.textContent = calculateTotalCost(allSubscriptions, "Monthly");
  }

  displayDashboard(shown);
  displaySubscriptions(shown);
};

const main = async () => {
  addLogoutListener();

  try {
    const subs = await getSubscriptions();

    if (subs === undefined) {
      throw new Error("Could not get subscriptions");
    }

    allSubscriptions = subs;
    applySubscriptionView();

    window.addEventListener("subscription-deleted", (event) => {
      const subId = Number(event.detail.subId);
      allSubscriptions = allSubscriptions.filter((sub) => sub.id !== subId);
      applySubscriptionView();
    });

    const filterButton = document.getElementById("filter-button");
    const searchButton = document.getElementById("search-button");
    const sortButton = document.getElementById("sort-button");

    let isFilterClicked = false;
    let isSortClicked = false;
    let isSearchClicked = false;

    if (filterButton) {
      filterButton.addEventListener("click", () => {
        const filterOptions = document.querySelector(".filters");

        if (isFilterClicked) {
          filterOptions.replaceChildren();
          isFilterClicked = false;
          return;
        }
        filterOptions.replaceChildren();

        const monthly = document.createElement("button");
        monthly.textContent = "Monthly";
        monthly.classList.add("monthly");
        filterOptions.appendChild(monthly);

        const yearly = document.createElement("button");
        yearly.textContent = "Yearly";
        yearly.classList.add("yearly");
        filterOptions.appendChild(yearly);

        const clearFilter = document.createElement("button");
        clearFilter.textContent = "X";
        clearFilter.classList.add("clear-button");
        filterOptions.appendChild(clearFilter);

        isFilterClicked = true;

        monthly.addEventListener("click", () => {
          const value = "Monthly";
          activeBillingFilter = value;
          applySubscriptionView();
        });

        yearly.addEventListener("click", () => {
          const value = "Yearly";
          activeBillingFilter = value;
          applySubscriptionView();
        });

        clearFilter.addEventListener("click", () => {
          activeBillingFilter = "";
          applySubscriptionView();
        });
      });
    }
    if (sortButton) {
      sortButton.addEventListener("click", () => {
        const sortOptions = document.querySelector(".sort-options");

        if (isSortClicked) {
          sortOptions.replaceChildren();
          isSortClicked = false;
          return;
        }
        sortOptions.replaceChildren();

        const price = document.createElement("button");
        price.textContent = "Price";
        price.classList.add("price");
        sortOptions.appendChild(price);

        const renewalDate = document.createElement("button");
        renewalDate.textContent = "Renewal date";
        renewalDate.classList.add("renewal-date");
        sortOptions.appendChild(renewalDate);

        const name = document.createElement("button");
        name.textContent = "Name";
        name.classList.add("name");
        sortOptions.appendChild(name);

        const clearFilter = document.createElement("button");
        clearFilter.textContent = "X";
        clearFilter.classList.add("clear-button");
        sortOptions.appendChild(clearFilter);

        isSortClicked = true;

        price.addEventListener("click", () => {
          if (activeSort !== "price") {
            activeSort = "price";
            activeSortDirection = "asc";
          } else {
            activeSortDirection =
              activeSortDirection === "asc" ? "desc" : "asc";
          }
          applySubscriptionView();
        });

        renewalDate.addEventListener("click", () => {
          if (activeSort !== "date") {
            activeSort = "date";
            activeSortDirection = "asc";
          } else {
            activeSortDirection =
              activeSortDirection === "asc" ? "desc" : "asc";
          }
          applySubscriptionView();
        });

        name.addEventListener("click", () => {
          if (activeSort !== "name") {
            activeSort = "name";
            activeSortDirection = "asc";
          } else {
            activeSortDirection =
              activeSortDirection === "asc" ? "desc" : "asc";
          }
          applySubscriptionView();
        });

        clearFilter.addEventListener("click", () => {
          activeSort = "";
          activeSortDirection = "";
          applySubscriptionView();
        });
      });
    }

    if (searchButton) {
      searchButton.addEventListener("click", (e) => {
        if (e.target.classList.contains("search")) return;

        if (isSearchClicked) {
          searchButton.querySelector(".search")?.remove();
          searchButton.classList.remove("expanded");
          activeSearch = "";
          applySubscriptionView();
          isSearchClicked = false;
          return;
        }

        const searchBox = document.createElement("input");
        searchBox.type = "text";
        searchBox.classList.add("search");
        searchBox.setAttribute("aria-label", "Search subscriptions");
        searchButton.classList.add("expanded");
        searchButton.appendChild(searchBox);
        isSearchClicked = true;
        searchBox.focus();

        searchBox.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            activeSearch = searchBox.value.trim();
            applySubscriptionView();
          }
        });
      });
    }
  } catch (error) {
    console.log(error);
  }
};

main();

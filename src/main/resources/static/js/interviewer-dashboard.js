async function loadDashboard() {

    const dashboardEl = document.getElementById("dashboardContent");

  if (!dashboardEl) {
    console.error("dashboardContent element not found!");
    return;
  }

  const token = localStorage.getItem("accessToken");

  if (!token) {
    dashboardEl.innerText = "Not logged in";
    return;
  }

  try {
    const response = await fetch("/api/interviewer-dashboard", {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    if (response.status === 401) {
      dashboardEl.innerText = "Session expired. Please login again.";
      localStorage.clear();
      window.location.href = "/login";
      return;
    }

    if (response.status === 403) {
  dashboardEl.innerText = "Access Denied (Insufficient permissions)";
  return;
}

    if (!response.ok) {
      dashboardEl.innerText = "Access Denied";
      return;
    }

    const data = await response.text();
    dashboardEl.innerText = data;

  } catch (err) {
    console.error(err);
    dashboardEl.innerText = "Server error";
  }
}


window.addEventListener("load", loadDashboard);
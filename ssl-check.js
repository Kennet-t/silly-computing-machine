document.getElementById("ssl-check-form").addEventListener("submit", function (event) {
    event.preventDefault();
    const domain = document.getElementById("domain").value;
    if (!domain) return;

    initiateCheck(domain);
});

const PROXY_URL = "https://cors-anywhere.herokuapp.com";

function initiateCheck(domain) {
    const apiUrl = `${PROXY_URL}/https://api.ssllabs.com/api/v3/analyze?host=${encodeURIComponent(domain)}`;
    fetch(apiUrl)
        .then(response => {
            if (response.ok) {
                return response.json()
            } else {
                throw new Error("Failed to fetch SSL/TLS data");
            }
        })
        .then(data => {
            if (data.status === "READY" || data.status === "ERROR") {
                displayResult(data);
            } else {
                setTimeout(() => {
                    initiateCheck(domain);
                }, 15000);
            }
        }).catch(error => {
            console.error("Error while fetching SSL/TLS data:", error);
        });
}

function displayResult(data) {
    const resultDiv = document.getElementById("result");
    let resultHtml = "";

    if (data && data.endpoints) {
        data.endpoints.forEach((endpoint) => {
            resultHtml += "<h2>Server IP: " + endpoint.ipAddress + "</h2>";
            // Add more properties and values to display here
        });
    } else {
        resultHtml = "<p>No SSL/TLS data found for the domain.</p>";
    }

    resultDiv.innerHTML = resultHtml;
}
document.addEventListener("DOMContentLoaded", async () => {
    const storedDomain = localStorage.getItem("searchedDomain");
    if (storedDomain) {
        await dnsLookup(storedDomain);
        localStorage.removeItem("searchedDomain");
    }
});

document.getElementById("lookup-form").addEventListener("submit", (event) => {
    event.preventDefault();

    const domain = document.getElementById("domain").value.trim();
    if (!domain) return;

    localStorage.setItem("searchedDomain", domain);
    window.location.reload();
});

async function dnsLookup(domain) {
    const dnsTypes = ["A", "CNAME", "MX", "NS", "SOA", "TXT"];
    const resultsElement = document.getElementById("results");

    resultsElement.innerHTML = `<h2>Results for domain: ${domain}</h2>`;

    for (const type of dnsTypes) {
        const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=${type}`;

        try {
            const response = await fetch(url, {
                headers: {
                    accept: "application/dns-json",
                },
            });

            if (!response.ok) {
                throw new Error(`Error with status ${response.status}`);
            }

            const data = await response.json();
            const records = data.Answer;

            let htmlToAdd = `<div class="result-section"><h3>${type} Records:</h3>`;
            let resultText = "";

            if (records && records.length) {
                resultText += "<ul>";
                records.forEach((record) => {
                    const { name, type, TTL, data } = record;
                    resultText += `<li><strong>Name:</strong> ${name} | <strong>Type:</strong> ${type} | <strong>TTL:</strong> ${TTL} | <strong>Value:</strong> ${data}</li>`;
                });
                resultText += "</ul>";

                if (type === "TXT") {
                    const spfRecord = records.find(
                        (record) => record.data.startsWith("v=spf1")
                    );

                    if (spfRecord) {
                        const parsedSPF = parseSPF(spfRecord.data);
                        resultText += `<h4>Expanded SPF Record:</h4><ul>`;
                        parsedSPF.terms.forEach((term) => {
                            resultText += `<li>${term}</li>`;
                        });
                        resultText += `</ul>`;
                        resultText += `<p><strong>Netblocks used:</strong> ${parsedSPF.netblocks.length}</p>`;
                        resultText += `<p><strong>DNS queries used:</strong> ${parsedSPF.dnsQueries} (out of 10)</p>`;
                    }
                }
            } else {
                resultText += "<p>No records found.</p>";
            }

            htmlToAdd += resultText + "</div>";
            resultsElement.innerHTML += htmlToAdd;
        } catch (error) {
            console.log("Error:", error);
            resultsElement.innerHTML += `<p>Error: Unable to fetch ${type} records - ${error.message}</p>`;
        }
    }
}

function parseSPF(spfRecord) {
    const spfTerms = spfRecord
        .split(" ")
        .filter((term) => term.startsWith("include:") || term.startsWith("ip4:") || term.startsWith("ip6:"));

    const netblocks = [];
    const dnsQueries = [];

    spfTerms.forEach((term) => {
        if (term.startsWith("include:")) {
            dnsQueries.push(term);
        } else {
            netblocks.push(term);
        }
    });

    return {
        terms: spfTerms,
        netblocks,
        dnsQueries: dnsQueries.length,
    };
}

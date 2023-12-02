document.getElementById('subnet-form').addEventListener('submit', (event) => {
    event.preventDefault();

    const ipAddress = document.getElementById('ip-address').value.trim();
    const prefixLengthInput = document.getElementById('prefix-length').value;

    if (!isValidIpAddress(ipAddress) || !isValidPrefixLength(prefixLengthInput)) {
        const resultsElement = document.getElementById('subnet-results');
        resultsElement.innerHTML = `<p>Error: Invalid IP address or prefix length</p>`;
        return;
    }

    const prefixLength = parseInt(prefixLengthInput, 10);
    const results = calculateSubnet(ipAddress, prefixLength);
    const wildcardMask = results.networkMask.split('.').map(octet => 255 - parseInt(octet, 10)).join('.');
    const hostMin = results.networkAddress.split('.').map((octet, index) => index < 3 ? octet : (parseInt(octet, 10) + 1).toString()).join('.');
    const hostMax = results.broadcastAddress.split('.').map((octet, index) => index < 3 ? octet : (parseInt(octet, 10) - 1).toString()).join('.');
    const networkClass = getNetworkClass(ipAddress);

    const ipAddressBinary = ipAddress.split('.').map(num => parseInt(num, 10).toString(2).padStart(8, '0')).join(' .');
    const subnetMaskBinary = results.networkMask.split('.').map(num => parseInt(num, 10).toString(2).padStart(8, '0')).join(' .');

    const resultsElement = document.getElementById('subnet-results');

    resultsElement.innerHTML = `
        <p><strong>Address:</strong> ${ipAddress} (${ipAddressBinary}) (Class ${networkClass})</p>
        <p><strong>Netmask:</strong> ${results.networkMask} (${subnetMaskBinary})</p>
        <p><strong>Prefix Size:</strong> ${prefixLength} (Subnet Bits: ${prefixLength}, Host Bits: ${32 - prefixLength})</p>
        <hr>
        <p><strong>Network:</strong> ${results.networkAddress}/${prefixLength}</p>
        <p><strong>Broadcast:</strong> ${results.broadcastAddress}</p>
        <p><strong>HostMin:</strong> ${hostMin}</p>
        <p><strong>HostMax:</strong> ${hostMax}</p>
        <p><strong>Hosts/Net:</strong> ${results.numberOfHosts}</p>`;
});

function getNetworkClass(ipAddress) {
    const firstOctet = parseInt(ipAddress.split('.')[0], 10);

    if (firstOctet >= 1 && firstOctet <= 126) {
        return 'A';
    } else if (firstOctet >= 128 && firstOctet <= 191) {
        return 'B';
    } else if (firstOctet >= 192 && firstOctet <= 223) {
        return 'C';
    } else {
        return 'Any';
    }
}

function isValidIpAddress(ipAddress) {
    const regex = RegExp(/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/);
    return regex.test(ipAddress);
}

function isValidPrefixLength(prefixLength) {
    return prefixLength >= 0 && prefixLength <= 32;
}

function calculateSubnet(ipAddress, prefixLength) {
    const ip = ipAddress.split('.').map(Number);
    const subnetMask = (1n << 32n) - (1n << (32n - BigInt(prefixLength)));
    const networkMask = Array.from(subnetMask.toString(2).padStart(32, '0').match(/.{8}/g)).map(n => parseInt(n, 2)).join('.');
    const networkAddress = ip.map((octet, index) =>octet & parseInt(networkMask.split('.')[index], 10));
    const broadcastAddress = ip.map((octet, index) => octet | (~parseInt(networkMask.split('.')[index], 10) & 255));
    const numberOfHosts = 2 ** (32 - prefixLength) - 2;

    return {
        networkAddress: networkAddress.join('.'),
        broadcastAddress: broadcastAddress.join('.'),
        numberOfHosts,
        networkMask,
    };
}
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DNS Lookup Tool</title>
    <link rel="stylesheet" href="style.css">
    <script src="lookup.js" defer></script>
</head>
<body>
    <header>
        <nav>
            <ul>
                <li><a href="index.html">Home</a></li>
                <li><a href="dns-lookup.html">DNS Lookup Tool</a></li>
                <!-- Add more tools here as list items -->
            </ul>
        </nav>
    </header>
    <main>
        <div class="container">
            <h1>DNS Lookup Tool</h1>
            <form id="lookup-form">
                <input type="text" id="domain" name="domain" placeholder="example.com" required>
                <br>
                <input type="submit" value="Lookup">
            </form>
            <div id="results">
                <div id="loading" style="display:none;">Loading...</div>
            </div>
        </div>
    </main>
</body>
</html>

const fs = require('fs');

try {
    const path = 'src/pages/auth/SignUp.jsx';
    let content = fs.readFileSync(path, 'utf8');
    content = content.replace(/t\('common:/g, "t('auth:");
    fs.writeFileSync(path, content, 'utf8');
    console.log("Successfully replaced common: with auth: in SignUp.jsx");
} catch (e) {
    console.error("Error occurred:", e);
    process.exit(1);
}

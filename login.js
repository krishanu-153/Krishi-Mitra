const CLIENT_ID = '1042547333874-3rtlhqvkb13bpp4dp5cejv2minl91pv9.apps.googleusercontent.com';

window.onload = function () {
    google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: handleCredentialResponse
    });

    google.accounts.id.renderButton(
        document.getElementById('google-signin-btn'),
        { theme: 'outline', size: 'large', text: 'signin_with', shape: 'pill' }
    );
};

function handleCredentialResponse(response) {
    // Decode JWT to get user info
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    console.log('Logged in as:', payload.name);

    // Hide login overlay
    document.getElementById('login-overlay').style.display = 'none';

    // Store user info (optional)
    sessionStorage.setItem('user', JSON.stringify({
        name: payload.name,
        email: payload.email,
        picture: payload.picture
    }));
}
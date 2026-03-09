// --- Global State ---
// This object will hold the current user's data after they log in
let currentUser = null;

// Your backend server's URL. Make sure the port is correct.
const API_URL = '';

// A wrapper function to contain all app initialization logic
window.onload = function() {
    // --- Page & Element References ---
    // A helper function to get elements by their ID
    const el = (id) => document.getElementById(id);

    // All Page Containers
    const loginPage = el('loginPage');
    const registerPage = el('registerPage');
    const dashboardPage = el('dashboardPage');
    const feedPage = el('feedPage');
    const allPages = [loginPage, registerPage, dashboardPage, feedPage];

    // Navigation Links & Buttons
    const navToRegister = el('navToRegister');
    const navToLogin = el('navToLogin');
    const navToFeed = el('navToFeed');
    const navToDashboardFromFeed = el('navToDashboardFromFeed');
    const logoutButton = el('logoutButton');

    // Forms
    const loginForm = el('loginForm');
    const registerForm = el('registerForm');
    const createPostForm = el('createPostForm');

    // Response Message Displays
    const loginResponse = el('loginResponse');
    const registerResponse = el('registerResponse');
    const postResponse = el('postResponse');

    // Dashboard Elements
    const welcomeMessage = el('welcomeMessage');
    const getMissionBtn = el('getMissionBtn');
    const missionDisplay = el('missionDisplay');

    // Feed Elements
    const feedContainer = el('feedContainer');

    // --- Page Navigation Function ---
    // A function to hide all pages and then show just one
    function showPage(pageToShow) {
        allPages.forEach(page => {
            if (page) page.style.display = 'none';
        });
        if (pageToShow) pageToShow.style.display = 'block';
    }

    // --- Helper Function for Responses ---
    // Shows a message in a response element and optionally fades it
    function showResponse(element, message, color, fadeOutTime = 0) {
        if (!element) return;
        element.textContent = message;
        element.style.color = color;

        if (fadeOutTime > 0) {
            setTimeout(() => {
                element.textContent = '';
            }, fadeOutTime);
        }
    }


    // --- Event Listeners for Navigation ---
    navToRegister.addEventListener('click', (e) => {
        e.preventDefault(); // Stop the link from jumping
        showPage(registerPage);
    });

    navToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        showPage(loginPage);
    });

    navToFeed.addEventListener('click', (e) => {
        e.preventDefault();
        showPage(feedPage);
        loadFeed(); // Load the feed every time we navigate to it
    });

    navToDashboardFromFeed.addEventListener('click', (e) => {
        e.preventDefault();
        showPage(dashboardPage);
    });

    logoutButton.addEventListener('click', () => {
        currentUser = null; // Clear the user's data
        showPage(loginPage); // Go back to the login page
        // Clear sensitive info from the dashboard
        welcomeMessage.textContent = 'Welcome!';
        missionDisplay.innerHTML = '';
    });

    // --- API Functions ---

    // 1. Handle User Registration
 registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    showResponse(registerResponse, 'Account created! (Demo Mode)', 'green');
    registerForm.reset();

    setTimeout(() => {
        showPage(loginPage);
    }, 1000);
});
            const data = await res.json();

            if (res.status === 201) {
                showResponse(registerResponse, 'Success! Please log in.', 'var(--success-color)');
                registerForm.reset();
                setTimeout(() => showPage(loginPage), 2000); 
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            showResponse(registerResponse, `Error: ${err.message}`, 'var(--danger-color)');
        }
    });

    // 2. Handle User Login
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const username = el('loginUsername').value;

    currentUser = { username: username };

    welcomeMessage.textContent = `Welcome, ${username}!`;

    loginForm.reset();

    setTimeout(() => {
        showPage(dashboardPage);
    }, 500);
});

            const data = await res.json();

            if (res.status === 200) {
                currentUser = data.user; // Store the logged-in user's data
                showResponse(loginResponse, 'Success!', 'var(--success-color)');
                loginForm.reset();
                
                welcomeMessage.textContent = `Welcome, ${currentUser.username}!`;
                missionDisplay.innerHTML = ''; 
                postResponse.innerHTML = '';
                
                setTimeout(() => {
                    showPage(dashboardPage);
                    loginResponse.textContent = '';
                }, 1000);
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            showResponse(loginResponse, `Error: ${err.message}`, 'var(--danger-color)');
        }
    });

    // 3. Handle Getting a Mission
    getMissionBtn.addEventListener('click', () => {
    missionDisplay.innerHTML = `
        <h4>Daily Mission</h4>
        <p>Write one paragraph about something you learned today.</p>
    `;
});

    // 4. Handle Creating a Blog Post
    createPostForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = el('postTitle').value;
        const content = el('postContent').value;

        if (!currentUser) {
            showResponse(postResponse, 'You must be logged in to post.', 'var(--danger-color)');
            return;
        }

        showResponse(postResponse, 'Posting...', 'var(--text-light)');

        try {
            const res = await fetch(`${API_URL}/blogs/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    content,
                    authorId: currentUser.id,
                    authorUsername: currentUser.username
                })
            });

            const data = await res.json();

            if (res.status === 201) {
                showResponse(postResponse, 'Post created successfully!', 'var(--success-color)');
                createPostForm.reset();
                setTimeout(() => postResponse.textContent = '', 3000);
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            showResponse(postResponse, `Error: ${err.message}`, 'var(--danger-color)');
        }
    });

    // 5. Handle Loading the Feed
    async function loadFeed() {
        feedContainer.innerHTML = '<p>Loading feed...</p>';

        try {
            const res = await fetch(`${API_URL}/blogs/all`);
            const blogs = await res.json();

            if (res.status !== 200) {
                throw new Error(blogs.message);
            }

            if (blogs.length === 0) {
                feedContainer.innerHTML = '<p>No posts yet. Be the first!</p>';
                return;
            }

            feedContainer.innerHTML = ''; // Clear "Loading..."
            blogs.forEach(post => {
                const postElement = document.createElement('div');
                postElement.className = 'blog-post';
                
                const postDate = new Date(post.createdAt).toLocaleString();

                // Render all comments
                let commentsHtml = '';
                if (post.comments && post.comments.length > 0) {
                    commentsHtml = post.comments.map(comment => `
                        <div class="comment">
                            <p class="comment-author">${comment.authorUsername}</p>
                            <p class="comment-text">${comment.text}</p>
                        </div>
                    `).join('');
                } else {
                    commentsHtml = '<p class="no-comments" style="font-size: 0.9rem; color: var(--text-light);">No comments yet.</p>';
                }

                // --- HTML FOR THE POST (NO LIKE BUTTON) ---
                postElement.innerHTML = `
                    <div class="blog-post-header">
                        <h3>${post.title}</h3>
                        <p class="blog-post-author">by ${post.authorUsername} on ${postDate}</p>
                    </div>
                    <div class="blog-post-content">
                        <p>${post.content}</p>
                    </div>
                    
                    <div class="comments-section">
                        <h4>Comments</h4>
                        <div class="comments-list" id="comments-for-${post._id}">
                            ${commentsHtml}
                        </div>
                        <form class="comment-form" data-postid="${post._id}">
                            <input type="text" placeholder="Write a comment..." required>
                            <button type="submit">Comment</button>
                            <div class="response-message comment-response"></div>
                        </form>
                    </div>
                `;
                feedContainer.appendChild(postElement);
            });

            // Attach listeners for comment forms
            feedContainer.querySelectorAll('.comment-form').forEach(form => {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const postId = form.dataset.postid;
                    const commentInput = form.querySelector('input[type="text"]');
                    const commentText = commentInput.value;
                    handleAddComment(postId, commentText, form);
                });
            });

        } catch (err) {
            feedContainer.innerHTML = `<p style="color: var(--danger-color);">Error loading feed: ${err.message}</p>`;
        }
    }

    // 6. Handle Adding a Comment (Updated for instant UI)
    async function handleAddComment(postId, text, form) {
        if (!currentUser) {
            const responseEl = form.querySelector('.comment-response');
            showResponse(responseEl, 'You must be logged in to comment.', 'var(--danger-color)', 3000);
            return;
        }

        // Prevent empty comments
        if (!text.trim()) {
            const responseEl = form.querySelector('.comment-response');
            showResponse(responseEl, 'Comment cannot be empty.', 'var(--danger-color)', 3000);
            return;
        }

        try {
            const res = await fetch(`${API_URL}/blogs/comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    postId,
                    text,
                    authorUsername: currentUser.username
                })
            });

            const newComment = await res.json(); // Server now sends back just the new comment

            if (res.status === 201) {
                // --- Instant UI Update ---
                const commentsList = el(`comments-for-${postId}`);
                
                // Remove "No comments yet" if it exists
                const noComments = commentsList.querySelector('.no-comments');
                if (noComments) {
                    noComments.remove();
                }

                const newCommentElement = document.createElement('div');
                newCommentElement.className = 'comment';
                newCommentElement.innerHTML = `
                    <p class="comment-author">${newComment.authorUsername}</p>
                    <p class="comment-text">${newComment.text}</p>
                `;
                commentsList.appendChild(newCommentElement);
                form.reset();
                // --- End Instant UI Update ---
            } else {
                throw new Error(newComment.message);
            }
        } catch (err) {
            const responseEl = form.querySelector('.comment-response');
            showResponse(responseEl, `Error: ${err.message}`, 'var(--danger-color)', 3000);
        }
    }

    // --- Initial App Load ---
    // When the page first loads, show the login page
    showPage(loginPage);
}; // End of window.onload

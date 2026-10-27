'use strict';

// Sample articles shown when the project is opened for the first time.
const starterPosts = [
	{
		id: 'static-web-basics',
		title: 'A Beginner’s Guide to the Modern Web',
		category: 'Technology',
		date: '2026-10-08',
		content: 'The web is built on a few powerful foundations: HTML gives a page its structure, CSS controls its appearance, and JavaScript adds interaction.\n\nYou do not need a large framework to make a useful website. A small project with clear files can be easier to learn, debug, and explain.\n\nStart with one feature, test it in the browser, and then build the next one. This habit makes frontend development feel much more manageable.'
	},
	{
		id: 'design-rhythm',
		title: 'The Quiet Power of Good Design',
		category: 'Design',
		date: '2026-10-04',
		content: 'Good design is not only about decoration. It helps people understand what matters and where to look next.\n\nConsistent spacing, readable text, useful contrast, and clear headings create a comfortable reading experience. A page does not need many animations to feel polished.\n\nWhen designing a card layout, keep the title, summary, category, and action in a predictable order. Familiar patterns make a website easier to use.'
	},
	{
		id: 'learning-by-building',
		title: 'Learn Faster by Building Small Projects',
		category: 'Learning',
		date: '2026-09-29',
		content: 'Tutorials are useful, but you learn more when you change the example and see what happens.\n\nTry building a small feature, such as a search box or theme toggle. Explain the purpose of each function in your own words. If something breaks, inspect the browser console and test one change at a time.\n\nA project you understand is more valuable in a viva than a complicated project you cannot explain.'
	},
	{
		id: 'first-project-checklist',
		title: 'A Practical Checklist for Your First Web Project',
		category: 'Projects',
		date: '2026-09-20',
		content: 'Before sharing a website, check its navigation, forms, empty states, and layout at different screen widths.\n\nUse meaningful filenames and keep HTML, CSS, and JavaScript organized. Test a form with both valid and invalid input. Refresh the page to understand which data persists and which data does not.\n\nFinally, document the known limitations. Clear documentation is part of a good project.'
	},
	{
		id: 'student-tech-portfolio',
		title: 'Turning Classwork into a Portfolio',
		category: 'Career',
		date: '2026-09-12',
		content: 'A useful student portfolio explains what you built, which technologies you used, and what you learned.\n\nInclude screenshots if appropriate, a short setup guide, and a link to the source code. Be honest about the parts that are prototypes or frontend-only demonstrations.\n\nYou do not need to pretend a small project is a production platform. Showing that you understand your design decisions is a strong starting point.'
	}
];

// Keys used to save information in the browser.
const STORAGE_KEYS = {
	posts: 'auralog.posts.v1',
	comments: 'auralog.comments.v1',
	theme: 'auralog.theme.v1'
};

let posts = loadFromStorage(STORAGE_KEYS.posts, starterPosts);
let comments = loadFromStorage(STORAGE_KEYS.comments, {});
let activePostId = null;
let toastTimer;

const postGrid = document.getElementById('postGrid');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const articleDialog = document.getElementById('articleDialog');

// Read saved information from browser storage.
function loadFromStorage(key, fallback) {
	try {
		const saved = localStorage.getItem(key);
		return saved ? JSON.parse(saved) : fallback;
	} catch (error) {
		console.warn('Could not read saved data:', error);
		return fallback;
	}
}

// Save information in browser storage.
function saveToStorage(key, value) {
	try {
		localStorage.setItem(key, JSON.stringify(value));
		return true;
	} catch (error) {
		console.error('Could not save data:', error);
		return false;
	}
}

// Create a unique ID for a new article.
function makeId() {
	return 'post-' + Date.now().toString(36) + '-' +
		Math.random().toString(36).slice(2, 7);
}

// Format a date so it is easier to read.
function formatDate(dateValue) {
	const date = new Date(dateValue + 'T12:00:00');
	return Number.isNaN(date.getTime())
		? dateValue
		: date.toLocaleDateString(undefined, {
				year: 'numeric',
				month: 'short',
				day: 'numeric'
			});
}

// Create a short preview of an article.
function getExcerpt(content) {
	const text = content.replace(/\s+/g, ' ').trim();
	return text.length > 145 ? text.slice(0, 142) + '…' : text;
}

// Update the category dropdown using available articles.
function refreshCategories() {
	const selected = categoryFilter.value || 'all';
	const categories = [...new Set(posts.map(post => post.category))].sort();
	categoryFilter.replaceChildren();

	const allOption = document.createElement('option');
	allOption.value = 'all';
	allOption.textContent = 'All categories';
	categoryFilter.append(allOption);

	categories.forEach(category => {
		const option = document.createElement('option');
		option.value = category;
		option.textContent = category;
		categoryFilter.append(option);
	});

	categoryFilter.value = categories.includes(selected) ? selected : 'all';
}

// Display articles after applying search and category filters.
function renderPosts() {
	const searchTerm = searchInput.value.trim().toLowerCase();
	const selectedCategory = categoryFilter.value;
	const visiblePosts = posts.filter(post => {
		const searchableText = post.title + ' ' + post.category + ' ' + post.content;
		const matchesSearch = searchableText.toLowerCase().includes(searchTerm);
		const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
		return matchesSearch && matchesCategory;
	});

	postGrid.replaceChildren();
	document.getElementById('postCount').textContent =
		`${visiblePosts.length} ARTICLE${visiblePosts.length === 1 ? '' : 'S'}`;
	document.getElementById('resultsMessage').textContent = visiblePosts.length
		? `Showing ${visiblePosts.length} of ${posts.length} article${posts.length === 1 ? '' : 's'}.`
		: '';

	if (!visiblePosts.length) {
		const empty = document.createElement('div');
		empty.className = 'empty-state';
		const heading = document.createElement('h3');
		heading.textContent = 'No articles found';
		const message = document.createElement('p');
		message.textContent = 'Try another search phrase or choose All categories.';
		empty.append(heading, message);
		postGrid.append(empty);
		return;
	}

	visiblePosts.forEach(post => {
		const card = document.createElement('article');
		card.className = 'post-card';
		const top = document.createElement('div');
		top.className = 'card-top';
		const category = document.createElement('span');
		category.className = 'category-pill';
		category.textContent = post.category;
		const date = document.createElement('time');
		date.className = 'post-date';
		date.dateTime = post.date;
		date.textContent = formatDate(post.date);
		top.append(category, date);

		const title = document.createElement('h3');
		title.textContent = post.title;
		const excerpt = document.createElement('p');
		excerpt.textContent = getExcerpt(post.content);
		const bottom = document.createElement('div');
		bottom.className = 'card-bottom';
		const commentCount = (comments[post.id] || []).length;
		const meta = document.createElement('span');
		meta.className = 'card-meta';
		meta.textContent = `${commentCount} comment${commentCount === 1 ? '' : 's'}`;
		const readButton = document.createElement('button');
		readButton.className = 'read-more';
		readButton.type = 'button';
		readButton.textContent = 'Read article ↗';
		readButton.addEventListener('click', () => openArticle(post.id));
		bottom.append(meta, readButton);
		card.append(top, title, excerpt, bottom);
		postGrid.append(card);
	});
}

// Open the full article and its comments.
function openArticle(postId) {
	const post = posts.find(item => item.id === postId);
	if (!post) return;
	activePostId = postId;
	const detail = document.getElementById('articleDetail');
	detail.replaceChildren();
	const category = document.createElement('span');
	category.className = 'category-pill article-detail-category';
	category.textContent = post.category;
	const title = document.createElement('h1');
	title.textContent = post.title;
	const byline = document.createElement('p');
	byline.className = 'article-byline';
	byline.textContent = `AuraLog Journal · ${formatDate(post.date)}`;
	const body = document.createElement('div');
	body.className = 'article-body';
	post.content.split(/\n\s*\n/).forEach(paragraph => {
		if (paragraph.trim()) {
			const p = document.createElement('p');
			p.textContent = paragraph.trim();
			body.append(p);
		}
	});
	detail.append(category, title, byline, body);
	document.getElementById('commentText').value = '';
	document.getElementById('commentMessage').textContent = '';
	renderComments();
	articleDialog.showModal();
}

// Display comments for the currently open article.
function renderComments() {
	const list = document.getElementById('commentList');
	list.replaceChildren();
	const postComments = comments[activePostId] || [];
	if (!postComments.length) {
		const empty = document.createElement('p');
		empty.className = 'muted';
		empty.textContent = 'No comments yet. You can start the conversation.';
		list.append(empty);
		return;
	}

	postComments.forEach(comment => {
		const item = document.createElement('div');
		item.className = 'comment-item';
		const name = document.createElement('strong');
		name.textContent = 'Reader';
		const time = document.createElement('time');
		time.textContent = formatDate(comment.date);
		const text = document.createElement('p');
		text.textContent = comment.text;
		item.append(name, time, text);
		list.append(item);
	});
}

// Show a temporary notification.
function showToast(message) {
	const toast = document.getElementById('toast');
	toast.textContent = message;
	toast.classList.add('show');
	clearTimeout(toastTimer);
	toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

// Open the form for writing a new article.
function showCreateForm() {
	const section = document.getElementById('createSection');
	section.hidden = false;
	section.scrollIntoView({ behavior: 'smooth', block: 'start' });
	document.getElementById('postTitle').focus();
}

// Hide the article creation form.
function hideCreateForm() {
	document.getElementById('createSection').hidden = true;
	document.getElementById('formMessage').textContent = '';
}

// Apply the selected colour theme.
function setTheme(theme) {
	document.body.classList.toggle('dark', theme === 'dark');
	document.getElementById('themeToggle').textContent =
		theme === 'dark' ? '☀ Light mode' : '☾ Dark mode';
	document.getElementById('themeToggle').setAttribute('aria-pressed', String(theme === 'dark'));
}

document.getElementById('themeToggle').addEventListener('click', () => {
	const nextTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
	setTheme(nextTheme);
	saveToStorage(STORAGE_KEYS.theme, nextTheme);
});
document.getElementById('openPostForm').addEventListener('click', showCreateForm);
document.getElementById('heroWrite').addEventListener('click', showCreateForm);
document.getElementById('closePostForm').addEventListener('click', hideCreateForm);
searchInput.addEventListener('input', renderPosts);
categoryFilter.addEventListener('change', renderPosts);

document.getElementById('closeArticle').addEventListener('click', () => articleDialog.close());
articleDialog.addEventListener('click', event => {
	if (event.target === articleDialog) articleDialog.close();
});

// Handle publishing a new article.
document.getElementById('postForm').addEventListener('submit', event => {
	event.preventDefault();
	const title = document.getElementById('postTitle').value.trim();
	const category = document.getElementById('postCategory').value;
	const content = document.getElementById('postContent').value.trim();
	const message = document.getElementById('formMessage');
	if (!title || !category || !content) {
		message.textContent = 'Please complete all fields.';
		return;
	}

	const newPost = {
		id: makeId(),
		title,
		category,
		content,
		date: new Date().toISOString().slice(0, 10)
	};
	posts.unshift(newPost);
	if (!saveToStorage(STORAGE_KEYS.posts, posts)) {
		posts.shift();
		message.textContent = 'Could not save this post. Check browser storage settings.';
		return;
	}
	refreshCategories();
	searchInput.value = '';
	categoryFilter.value = 'all';
	renderPosts();
	event.target.reset();
	hideCreateForm();
	showToast('Your article was published in this browser.');
	document.getElementById('articles').scrollIntoView({ behavior: 'smooth' });
});

// Handle comments on articles.
document.getElementById('commentForm').addEventListener('submit', event => {
	event.preventDefault();
	const input = document.getElementById('commentText');
	const message = document.getElementById('commentMessage');
	const text = input.value.trim();
	if (!text) {
		message.textContent = 'Please write a comment first.';
		return;
	}
	if (!activePostId || !posts.some(post => post.id === activePostId)) {
		message.textContent = 'This article is no longer available.';
		return;
	}

	const previous = comments[activePostId] || [];
	comments[activePostId] = [...previous, {
		text,
		date: new Date().toISOString().slice(0, 10)
	}];
	if (!saveToStorage(STORAGE_KEYS.comments, comments)) {
		comments[activePostId] = previous;
		message.textContent = 'Could not save the comment. Check browser storage settings.';
		return;
	}
	input.value = '';
	message.textContent = 'Comment added.';
	renderComments();
	renderPosts();
});

document.getElementById('year').textContent = new Date().getFullYear();
setTheme(loadFromStorage(STORAGE_KEYS.theme, 'light') === 'dark' ? 'dark' : 'light');
refreshCategories();
renderPosts();

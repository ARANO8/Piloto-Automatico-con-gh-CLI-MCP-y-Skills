const form = document.querySelector('#profile-form');
const card = document.querySelector('#profile-card');
const emptyState = document.querySelector('#empty-state');
const errorBox = document.querySelector('#form-error');
const footerStatus = document.querySelector('#footer-status');

const avatar = document.querySelector('.avatar');
const avatarImg = document.querySelector('#card-avatar');
const cardInitials = document.querySelector('#card-initials');
const LOGIN_RE = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/;

const FIELDS = [
  'login',
  'name',
  'avatarUrl',
  'company',
  'location',
  'blog',
  'twitter',
  'bio',
  'languages',
  'followers',
  'following',
  'publicRepos',
];

const num = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
};

const text = (value) => String(value ?? '').trim();

function readForm() {
  const fd = new FormData(form);
  return {
    login: text(fd.get('login')),
    name: text(fd.get('name')),
    avatarUrl: text(fd.get('avatarUrl')),
    bio: text(fd.get('bio')),
    company: text(fd.get('company')),
    location: text(fd.get('location')),
    blog: text(fd.get('blog')),
    twitter: text(fd.get('twitter')),
    languages: text(fd.get('languages')),
    followers: num(fd.get('followers')),
    following: num(fd.get('following')),
    publicRepos: num(fd.get('publicRepos')),
    hireable: fd.get('hireable') === 'on',
  };
}

function validate(profile) {
  if (!profile.login) return 'El usuario de GitHub es obligatorio.';
  if (!LOGIN_RE.test(profile.login)) return `"${profile.login}" no es un usuario valido.`;
  if (profile.avatarUrl && !/^https?:\/\//i.test(profile.avatarUrl)) {
    return 'La URL del avatar debe empezar por http:// o https://';
  }
  return '';
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.hidden = !message;
}

function initialsOf(profile) {
  const source = profile.name || profile.login;
  const parts = source.split(/[\s_-]+/).filter(Boolean);
  const letters = (parts.length > 1 ? [parts[0], parts.at(-1)] : [parts[0] ?? '?'])
    .map((word) => word[0])
    .join('');
  return (letters || '?').toUpperCase();
}

function chip(text, href) {
  const li = document.createElement('li');
  if (href) {
    const a = document.createElement('a');
    a.href = href;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = text;
    li.append(a);
  } else {
    li.textContent = text;
  }
  return li;
}

function renderLanguages(list, raw) {
  list.replaceChildren();
  for (const language of raw.split(',').map((item) => item.trim()).filter(Boolean)) {
    list.append(chip(language));
  }
}

function renderCard(profile) {
  const profileUrl = `https://github.com/${profile.login}`;

  avatarImg.removeAttribute('src');
  avatar.classList.remove('has-image');
  avatarImg.alt = `Avatar de ${profile.login}`;
  if (profile.avatarUrl) avatarImg.src = profile.avatarUrl;
  cardInitials.textContent = initialsOf(profile);

  document.querySelector('#card-name').textContent = profile.name || profile.login;

  const loginLink = document.querySelector('#card-login');
  loginLink.textContent = `@${profile.login}`;
  loginLink.href = profileUrl;

  document.querySelector('#card-bio').textContent = profile.bio;
  document.querySelector('#card-hireable').hidden = !profile.hireable;

  const meta = document.querySelector('#card-meta');
  meta.replaceChildren();
  if (profile.company) meta.append(chip(profile.company));
  if (profile.location) meta.append(chip(profile.location));
  if (profile.blog) meta.append(chip(profile.blog.replace(/^https?:\/\//, ''), profile.blog));
  if (profile.twitter) {
    const handle = profile.twitter.replace(/^@/, '');
    meta.append(chip(`@${handle}`, `https://x.com/${handle}`));
  }

  renderLanguages(document.querySelector('#card-languages'), profile.languages);

  document.querySelector('#stat-followers').textContent = profile.followers;
  document.querySelector('#stat-following').textContent = profile.following;
  document.querySelector('#stat-repos').textContent = profile.publicRepos;

  card.hidden = false;
  card.dataset.state = 'ready';
  emptyState.hidden = true;
  footerStatus.textContent = `Card generado para @${profile.login}.`;
}

function applyToForm(profile) {
  for (const field of FIELDS) {
    form.elements[field].value = profile[field] ?? '';
  }
  form.elements.hireable.checked = Boolean(profile.hireable);
  showError('');
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const profile = readForm();
  const error = validate(profile);
  showError(error);
  if (error) {
    form.elements.login.focus();
    return;
  }
  renderCard(profile);
});

form.addEventListener('reset', () => {
  showError('');
  for (const field of FIELDS) {
    if (typeof form.elements[field].value === 'string') form.elements[field].value = '';
  }
  for (const field of ['followers', 'following', 'publicRepos']) {
    form.elements[field].value = '0';
  }
  form.elements.hireable.checked = false;
  card.hidden = true;
  card.dataset.state = 'idle';
  emptyState.hidden = false;
  footerStatus.textContent = '';
});

avatarImg.addEventListener('load', () => avatar.classList.add('has-image'));
avatarImg.addEventListener('error', () => avatar.classList.remove('has-image'));
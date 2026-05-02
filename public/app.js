const API = 'http://localhost:5000/api/contacts';
let editingId = null;
let allContacts = [];

// Avatar colors palette
const avatarColors = [
  'linear-gradient(135deg,#4f7cff,#7c3aed)',
  'linear-gradient(135deg,#3ecf8e,#0891b2)',
  'linear-gradient(135deg,#f59e0b,#ef4444)',
  'linear-gradient(135deg,#ec4899,#8b5cf6)',
  'linear-gradient(135deg,#06b6d4,#3b82f6)',
  'linear-gradient(135deg,#10b981,#059669)',
  'linear-gradient(135deg,#f97316,#ef4444)',
  'linear-gradient(135deg,#6366f1,#8b5cf6)',
];

function getColor(name) {
  let h = 0;
  for (let c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return avatarColors[h % avatarColors.length];
}

function initials(name) {
  return name.trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

// ── Load ──
async function loadContacts() {
  try {
    const res = await fetch(API);
    allContacts = await res.json();
    displayContacts(allContacts);
  } catch {
    showToast('Could not connect to server', 'error');
  }
}

// ── Display ──
function displayContacts(contacts) {
  const list = document.getElementById('contacts-list');
  const empty = document.getElementById('empty-state');
  const countEl = document.getElementById('contact-count');

  countEl.textContent = `${contacts.length} contact${contacts.length !== 1 ? 's' : ''}`;

  if (contacts.length === 0) {
    list.innerHTML = '';
    empty.style.display = 'flex';
    return;
  }

  empty.style.display = 'none';
  list.innerHTML = contacts.map((c, i) => `
    <div class="contact-card" style="animation-delay:${i * 40}ms">
      <div class="card-top">
        <div class="avatar" style="background:${getColor(c.name)}">${initials(c.name)}</div>
        <div>
          <div class="card-name">${c.name}</div>
          <div class="card-email" title="${c.email}">${c.email}</div>
        </div>
      </div>

      <div class="card-details">
        ${c.phone ? `
        <div class="card-detail">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.58 3.4 2 2 0 0 1 3.55 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 6.29 6.29l1.42-1.42a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          ${c.phone}
        </div>` : ''}
        ${c.address ? `
        <div class="card-detail">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          ${c.address}
        </div>` : ''}
        ${!c.phone && !c.address ? `<div class="card-detail" style="color:var(--text-dim);font-style:italic">No additional info</div>` : ''}
      </div>

      <div class="card-actions">
        <button class="btn-edit" onclick="editContact('${c._id}')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Edit
        </button>
        <button class="btn-delete" onclick="deleteContact('${c._id}')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          Delete
        </button>
      </div>
    </div>
  `).join('');
}

// ── Modal ──
function showAddForm() {
  editingId = null;
  document.getElementById('modal-title').textContent = 'New Contact';
  document.getElementById('name').value = '';
  document.getElementById('email').value = '';
  document.getElementById('phone').value = '';
  document.getElementById('address').value = '';
  document.getElementById('avatar-preview').textContent = '?';
  document.getElementById('avatar-preview').style.background = 'linear-gradient(135deg,#4f7cff,#7c3aed)';
  openModal();
}

function openModal() {
  document.getElementById('modal-overlay').classList.add('open');
  document.getElementById('modal').classList.add('open');
  setTimeout(() => document.getElementById('name').focus(), 100);
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.getElementById('modal').classList.remove('open');
}

// ── Avatar preview ──
function updateAvatar() {
  const name = document.getElementById('name').value.trim();
  const av = document.getElementById('avatar-preview');
  if (name) {
    av.textContent = initials(name);
    av.style.background = getColor(name);
  } else {
    av.textContent = '?';
    av.style.background = 'linear-gradient(135deg,#4f7cff,#7c3aed)';
  }
}

// ── Save ──
async function saveContact() {
  const name    = document.getElementById('name').value.trim();
  const email   = document.getElementById('email').value.trim();
  const phone   = document.getElementById('phone').value.trim();
  const address = document.getElementById('address').value.trim();

  if (!name || !email) {
    showToast('Name and email are required', 'error');
    return;
  }

  const data = { name, email, phone, address };

  try {
    if (editingId) {
      await fetch(`${API}/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      showToast('Contact updated successfully', 'success');
    } else {
      await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      showToast('Contact added successfully', 'success');
    }
    closeModal();
    loadContacts();
  } catch {
    showToast('Something went wrong', 'error');
  }
}

// ── Edit ──
function editContact(id) {
  const c = allContacts.find(x => x._id === id);
  editingId = id;
  document.getElementById('modal-title').textContent = 'Edit Contact';
  document.getElementById('name').value    = c.name;
  document.getElementById('email').value   = c.email;
  document.getElementById('phone').value   = c.phone || '';
  document.getElementById('address').value = c.address || '';
  updateAvatar();
  openModal();
}

// ── Delete ──
async function deleteContact(id) {
  if (!confirm('Delete this contact?')) return;
  try {
    await fetch(`${API}/${id}`, { method: 'DELETE' });
    showToast('Contact deleted', 'success');
    loadContacts();
  } catch {
    showToast('Could not delete contact', 'error');
  }
}

// ── Search ──
function searchContacts() {
  const q = document.getElementById('search').value.toLowerCase();
  const filtered = allContacts.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.email.toLowerCase().includes(q) ||
    (c.phone && c.phone.includes(q))
  );
  displayContacts(filtered);
}

// ── Toast ──
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = (type === 'success' ? '✓  ' : '✕  ') + msg;
  t.className = `toast ${type} show`;
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ── Keyboard: Escape closes modal ──
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

loadContacts();
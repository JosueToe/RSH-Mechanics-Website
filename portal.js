/* RSG Staff Portal — work authorization form + exports */
(function () {
    'use strict';

    const DRAFT_KEY = 'rsg_work_auth_draft_v4';

    const $ = (id) => document.getElementById(id);
    const loginScreen = $('login-screen');
    const app = $('app');
    const userEmailEl = $('user-email');
    const statusToast = $('status-toast');
    const paper = $('paper');

    function showToast(message, isError) {
        statusToast.hidden = false;
        statusToast.textContent = message;
        statusToast.classList.toggle('error', !!isError);
        clearTimeout(showToast._t);
        showToast._t = setTimeout(() => { statusToast.hidden = true; }, 3200);
    }

    function showApp(email) {
        loginScreen.hidden = true;
        loginScreen.style.display = 'none';
        app.hidden = false;
        app.style.display = '';
        userEmailEl.textContent = email || 'Signed in';
    }

    function showLogin() {
        app.hidden = true;
        app.style.display = 'none';
        loginScreen.hidden = false;
        loginScreen.style.display = '';
        userEmailEl.textContent = '';
    }

    function hashParams() {
        const raw = (location.hash || '').replace(/^#/, '');
        return new URLSearchParams(raw);
    }

    function getInviteToken() {
        return hashParams().get('invite_token') || '';
    }

    function getRecoveryToken() {
        return hashParams().get('recovery_token') || '';
    }

    function clearAuthHash() {
        history.replaceState(null, '', location.pathname + location.search);
    }

    function showPanel(which) {
        const login = $('login-panel');
        const invite = $('invite-panel');
        const recovery = $('recovery-panel');
        if (login) login.hidden = which !== 'login';
        if (invite) invite.hidden = which !== 'invite';
        if (recovery) recovery.hidden = which !== 'recovery';
    }

    function setError(id, message) {
        const el = $(id);
        if (!el) return;
        if (message) {
            el.hidden = false;
            el.textContent = message;
        } else {
            el.hidden = true;
            el.textContent = '';
        }
    }

    function initAuth() {
        if (!window.netlifyIdentity) {
            showToast('Netlify Identity failed to load.', true);
            return;
        }

        // Show password UI immediately if this is an invite/reset link
        if (getInviteToken()) {
            showLogin();
            showPanel('invite');
        } else if (getRecoveryToken()) {
            showLogin();
            showPanel('recovery');
        } else {
            showPanel('login');
        }

        netlifyIdentity.on('init', (user) => {
            if (user) {
                showApp(user.email);
                return;
            }
            showLogin();
            if (getInviteToken()) showPanel('invite');
            else if (getRecoveryToken()) showPanel('recovery');
            else showPanel('login');
        });
        netlifyIdentity.on('login', (user) => {
            showApp(user.email);
            try { netlifyIdentity.close(); } catch (_) { /* ignore */ }
            clearAuthHash();
        });
        netlifyIdentity.on('logout', () => {
            showLogin();
            showPanel('login');
        });
        netlifyIdentity.on('error', (err) => {
            console.error(err);
            showToast(err?.message || 'Identity error', true);
        });
        netlifyIdentity.init();
    }

    async function acceptInvite() {
        const token = getInviteToken();
        const password = $('invite-password')?.value || '';
        const password2 = $('invite-password2')?.value || '';
        setError('invite-error', '');

        if (!token) {
            setError('invite-error', 'Invite link is missing or expired. Ask for a new invite.');
            return;
        }
        if (password.length < 6) {
            setError('invite-error', 'Password must be at least 6 characters.');
            return;
        }
        if (password !== password2) {
            setError('invite-error', 'Passwords do not match.');
            return;
        }
        if (!window.netlifyIdentity?.gotrue) {
            setError('invite-error', 'Identity is still loading — wait a second and try again.');
            return;
        }

        const btn = $('btn-accept-invite');
        if (btn) btn.disabled = true;
        try {
            const user = await netlifyIdentity.gotrue.acceptInvite(token, password);
            clearAuthHash();
            showApp(user?.email || 'Signed in');
            showToast('Account created — you are signed in');
        } catch (err) {
            console.error(err);
            setError('invite-error', err?.message || 'Could not accept invite. Request a new invite and try again.');
        } finally {
            if (btn) btn.disabled = false;
        }
    }

    async function resetPassword() {
        const token = getRecoveryToken();
        const password = $('recovery-password')?.value || '';
        const password2 = $('recovery-password2')?.value || '';
        setError('recovery-error', '');

        if (!token) {
            setError('recovery-error', 'Reset link is missing or expired.');
            return;
        }
        if (password.length < 6) {
            setError('recovery-error', 'Password must be at least 6 characters.');
            return;
        }
        if (password !== password2) {
            setError('recovery-error', 'Passwords do not match.');
            return;
        }
        if (!window.netlifyIdentity?.gotrue) {
            setError('recovery-error', 'Identity is still loading — wait a second and try again.');
            return;
        }

        const btn = $('btn-reset-password');
        if (btn) btn.disabled = true;
        try {
            const user = await netlifyIdentity.gotrue.recover(token, password);
            clearAuthHash();
            showApp(user?.email || 'Signed in');
            showToast('Password updated — you are signed in');
        } catch (err) {
            console.error(err);
            setError('recovery-error', err?.message || 'Could not reset password. Request a new reset email.');
        } finally {
            if (btn) btn.disabled = false;
        }
    }

    $('btn-login').addEventListener('click', () => {
        if (window.netlifyIdentity) netlifyIdentity.open('login');
        else showToast('Enable Netlify Identity in the site dashboard.', true);
    });

    $('btn-accept-invite')?.addEventListener('click', () => acceptInvite());
    $('btn-reset-password')?.addEventListener('click', () => resetPassword());
    $('invite-password2')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') acceptInvite();
    });
    $('recovery-password2')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') resetPassword();
    });

    $('btn-logout').addEventListener('click', () => {
        if (window.netlifyIdentity && netlifyIdentity.currentUser()) netlifyIdentity.logout();
        else showLogin();
    });

    /* ---------- Form sync ---------- */
    function put(id, value) {
        const el = $('out-' + id);
        if (el) el.textContent = value || '';
    }

    function formatDateDisplay(iso) {
        if (!iso) return '';
        const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})$/);
        return m ? `${m[2]}/${m[3]}/${m[1]}` : iso;
    }

    function formatTimeDisplay(t) {
        if (!t) return '';
        const m = String(t).match(/^(\d{1,2}):(\d{2})/);
        if (!m) return t;
        let h = parseInt(m[1], 10);
        const ap = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        return `${h}:${m[2]} ${ap}`;
    }

    function syncField(input) {
        const key = input.dataset.out;
        if (!key) return;
        let val = input.value;
        if (input.type === 'date') val = formatDateDisplay(val);
        if (input.type === 'time') val = formatTimeDisplay(val);
        put(key, val);
        if (key === 'laborcharge') put('laborcharge2', val);
        if (key === 'teardown') updateTeardownSentence(val);
        if (key === 'estimateInvoice') updateDocTitle(val);
    }

    function updateTeardownSentence(raw) {
        const el = $('out-teardown2');
        if (!el) return;
        const amt = String(raw || '').trim();
        el.textContent = amt ? `USD ${amt}` : 'the fee listed above';
    }

    function updateDocTitle(val) {
        const el = $('out-docType');
        if (!el) return;
        el.textContent = val || '';
        el.hidden = !val;
    }

    const TOTAL_TRIGGER_IDS = [
        'laborcharge', 'sublet', 'supplies', 'tax', 'diag',
        'extracharges', 'mandatedfee', 'teardown'
    ];

    document.querySelectorAll('[data-out]').forEach((input) => {
        input.addEventListener('input', () => {
            syncField(input);
            if (TOTAL_TRIGGER_IDS.includes(input.id)) maybeAutoTotal();
        });
        input.addEventListener('change', () => syncField(input));
    });

    function updateEstimate() {
        const choice = document.querySelector('input[name="estimate"]:checked')?.value || '';
        $('check-request').textContent = choice === 'request' ? '☒' : '☐';
        $('check-limit').textContent = choice === 'limit' ? '☒' : '☐';
        $('check-none').textContent = choice === 'none' ? '☒' : '☐';
        put('limit', $('limit').value);
    }

    document.querySelectorAll('input[name="estimate"]').forEach((x) => {
        x.addEventListener('change', updateEstimate);
    });
    $('limit').addEventListener('input', updateEstimate);

    function updateExtraApprovalMethod() {
        const val = document.querySelector('input[name="extraApprovalMethod"]:checked')?.value || '';
        $('am-oral').textContent = val === 'Oral' ? '☒ Oral' : '☐ Oral';
        $('am-written').textContent = val === 'Written' ? '☒ Written' : '☐ Written';
    }

    document.querySelectorAll('input[name="extraApprovalMethod"]').forEach((x) => {
        x.addEventListener('change', updateExtraApprovalMethod);
    });

    function updateSaveParts() {
        const val = document.querySelector('input[name="saveparts"]:checked')?.value || '';
        $('sp-yes').textContent = val === 'Yes' ? '☒ Yes' : '☐ Yes';
        $('sp-no').textContent = val === 'No' ? '☒ No (core may apply)' : '☐ No (core may apply)';
    }

    document.querySelectorAll('input[name="saveparts"]').forEach((x) => {
        x.addEventListener('change', updateSaveParts);
    });

    function updateLaborBasis() {
        const val = document.querySelector('input[name="laborbasis"]:checked')?.value || '';
        $('lb-flat').textContent = val === 'Flat rate' ? '☒ Flat rate' : '☐ Flat rate';
        $('lb-hourly').textContent = val === 'Hourly rate' ? '☒ Hourly rate' : '☐ Hourly rate';
        $('lb-both').textContent = val === 'Both apply' ? '☒ Both apply' : '☐ Both apply';
    }

    document.querySelectorAll('input[name="laborbasis"]').forEach((x) => {
        x.addEventListener('change', updateLaborBasis);
    });

    $('estimateInvoice').addEventListener('change', (e) => {
        updateDocTitle(e.target.value);
    });

    /* ---------- Repair lines ---------- */
    function addRepair(data) {
        const row = document.createElement('div');
        row.className = 'repair-items';
        row.innerHTML = `
            <input aria-label="Repair description" placeholder="Description of repair" value="${escAttr(data?.desc ?? '')}">
            <input aria-label="Labor type" placeholder="Flat / Hrs" value="${escAttr(data?.labor ?? '')}">
            <input aria-label="Charges" type="number" step="0.01" min="0" placeholder="Charge" inputmode="decimal" value="${escAttr(data?.charge ?? '')}">
            <button type="button" class="remove-repair" aria-label="Remove repair"><i class="fas fa-times"></i></button>
        `;
        row.querySelectorAll('input').forEach((i) => i.addEventListener('input', () => {
            renderRepairs();
            maybeAutoTotal();
        }));
        row.querySelector('.remove-repair').addEventListener('click', () => {
            const rows = document.querySelectorAll('.repair-items');
            if (rows.length <= 1) {
                row.querySelectorAll('input').forEach((i) => { i.value = ''; });
            } else {
                row.remove();
            }
            renderRepairs();
            maybeAutoTotal();
        });
        $('repairs-entry').appendChild(row);
        renderRepairs();
    }

    function getRepairs() {
        return [...document.querySelectorAll('.repair-items')].map((row) => {
            const [desc, labor, charge] = [...row.querySelectorAll('input')].map((x) => x.value);
            return { desc, labor, charge };
        });
    }

    function renderRepairs() {
        const tbody = $('out-repairs');
        tbody.innerHTML = '';
        const repairs = getRepairs().filter((r) => r.desc || r.labor || r.charge);

        repairs.forEach((r, i) => {
            const tr = document.createElement('tr');
            [String(i + 1), r.desc, r.labor, r.charge].forEach((x) => {
                const td = document.createElement('td');
                td.textContent = x;
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });

        while (tbody.children.length < 3) {
            const tr = document.createElement('tr');
            for (let j = 0; j < 4; j++) tr.appendChild(document.createElement('td'));
            tbody.appendChild(tr);
        }
    }

    $('add-repair').addEventListener('click', () => addRepair());

    /* ---------- Parts ---------- */
    function escAttr(v) {
        return String(v).replace(/"/g, '&quot;');
    }

    function addPart(data) {
        const row = document.createElement('div');
        row.className = 'lineitems';
        row.innerHTML = `
            <input aria-label="Quantity" placeholder="Qty" inputmode="decimal" value="${escAttr(data?.qty ?? '')}">
            <input aria-label="Part number" placeholder="Part no." value="${escAttr(data?.partNo ?? '')}">
            <input aria-label="Description" placeholder="Description" value="${escAttr(data?.desc ?? '')}">
            <input aria-label="Parts code" placeholder="*" maxlength="4" value="${escAttr(data?.code ?? '')}" title="U / R / RC / NC / RD">
            <input aria-label="Price" type="number" step="0.01" min="0" placeholder="Price" inputmode="decimal" value="${escAttr(data?.price ?? '')}">
            <button type="button" class="remove-part" aria-label="Remove part"><i class="fas fa-times"></i></button>
        `;
        row.querySelectorAll('input').forEach((i) => i.addEventListener('input', () => {
            renderParts();
            maybeAutoTotal();
        }));
        row.querySelector('.remove-part').addEventListener('click', () => {
            const rows = document.querySelectorAll('.lineitems');
            if (rows.length <= 1) {
                row.querySelectorAll('input').forEach((i) => { i.value = ''; });
            } else {
                row.remove();
            }
            renderParts();
            maybeAutoTotal();
        });
        $('parts-entry').appendChild(row);
        renderParts();
    }

    function getParts() {
        return [...document.querySelectorAll('.lineitems')].map((row) => {
            const [qty, partNo, desc, code, price] = [...row.querySelectorAll('input')].map((x) => x.value);
            return { qty, partNo, desc, code, price };
        });
    }

    function renderParts() {
        const tbody = $('out-parts');
        tbody.innerHTML = '';
        let sum = 0;
        const parts = getParts().filter((p) => p.qty || p.partNo || p.desc || p.code || p.price);

        parts.forEach((p) => {
            const tr = document.createElement('tr');
            [p.qty, p.partNo, p.desc, p.code, p.price].forEach((x) => {
                const td = document.createElement('td');
                td.textContent = x;
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
            const q = Number(p.qty) || 0;
            const pr = Number(p.price) || 0;
            sum += q > 0 ? q * pr : pr;
        });

        while (tbody.children.length < 3) {
            const tr = document.createElement('tr');
            for (let j = 0; j < 5; j++) tr.appendChild(document.createElement('td'));
            tbody.appendChild(tr);
        }

        put('partstotal', sum ? sum.toFixed(2) : '');
        return sum;
    }

    function maybeAutoTotal() {
        const parts = renderParts();
        renderRepairs();
        const labor = Number($('laborcharge').value) || 0;
        const sublet = Number($('sublet').value) || 0;
        const supplies = Number($('supplies').value) || 0;
        const diag = Number($('diag').value) || 0;
        const extra = Number($('extracharges').value) || 0;
        const mandated = Number($('mandatedfee').value) || 0;
        const tax = Number($('tax').value) || 0;
        const subtotal = parts + labor + sublet + supplies + diag + extra + mandated;
        if (!$('subtotal').dataset.manual) {
            $('subtotal').value = subtotal ? subtotal.toFixed(2) : '';
            put('subtotal', $('subtotal').value);
        }
        if (!$('total').dataset.manual) {
            const total = (Number($('subtotal').value) || 0) + tax;
            $('total').value = total ? total.toFixed(2) : '';
            put('total', $('total').value);
        }
    }

    $('subtotal').addEventListener('input', () => {
        $('subtotal').dataset.manual = '1';
        put('subtotal', $('subtotal').value);
    });
    $('total').addEventListener('input', () => {
        $('total').dataset.manual = '1';
        put('total', $('total').value);
    });

    $('add-part').addEventListener('click', () => addPart());

    function clearForm() {
        if (!confirm('Clear all entered information?')) return;
        document.querySelectorAll('.panel input:not([type=radio]), .panel textarea').forEach((x) => {
            x.value = '';
            delete x.dataset.manual;
        });
        document.querySelectorAll('.panel select').forEach((x) => { x.selectedIndex = 0; });
        $('state').value = 'FL';
        $('parts-entry').innerHTML = '';
        $('repairs-entry').innerHTML = '';
        document.querySelectorAll('input[name="estimate"]').forEach((r) => { r.checked = false; });
        document.querySelectorAll('input[name="saveparts"]').forEach((r) => { r.checked = false; });
        document.querySelectorAll('input[name="laborbasis"]').forEach((r) => { r.checked = false; });
        document.querySelectorAll('input[name="extraApprovalMethod"]').forEach((r) => { r.checked = false; });
        document.querySelectorAll('[data-out]').forEach((x) => put(x.dataset.out, ''));
        put('laborcharge2', '');
        updateTeardownSentence('');
        updateDocTitle('');
        updateEstimate();
        updateSaveParts();
        updateLaborBasis();
        updateExtraApprovalMethod();
        addRepair();
        addRepair();
        addPart();
        addPart();
        addPart();
        setDefaults();
        showToast('Form cleared');
        try { localStorage.removeItem(DRAFT_KEY); } catch (_) { /* ignore */ }
    }

    function setDefaults() {
        const today = new Date().toISOString().slice(0, 10);
        if (!$('date').value) {
            $('date').value = today;
            syncField($('date'));
        }
        if (!$('time').value) {
            const now = new Date();
            $('time').value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            syncField($('time'));
        }
    }

    function collectData() {
        const data = {};
        document.querySelectorAll('[data-out]').forEach((el) => {
            data[el.dataset.out] = el.value;
        });
        data.estimate = document.querySelector('input[name="estimate"]:checked')?.value || '';
        data.saveparts = document.querySelector('input[name="saveparts"]:checked')?.value || '';
        data.laborbasis = document.querySelector('input[name="laborbasis"]:checked')?.value || '';
        data.extraApprovalMethod = document.querySelector('input[name="extraApprovalMethod"]:checked')?.value || '';
        data.parts = getParts();
        data.repairs = getRepairs();
        return data;
    }

    function loadDraft() {
        try {
            const raw = localStorage.getItem(DRAFT_KEY);
            if (!raw) return false;
            const data = JSON.parse(raw);
            Object.keys(data).forEach((key) => {
                if (['parts', 'repairs', 'estimate', 'saveparts', 'laborbasis', 'extraApprovalMethod'].includes(key)) return;
                const el = document.querySelector(`[data-out="${key}"]`);
                if (el) {
                    el.value = data[key] ?? '';
                    syncField(el);
                }
            });
            if (data.estimate) {
                const r = document.querySelector(`input[name="estimate"][value="${data.estimate}"]`);
                if (r) r.checked = true;
            }
            if (data.saveparts) {
                const r = document.querySelector(`input[name="saveparts"][value="${data.saveparts}"]`);
                if (r) r.checked = true;
            }
            if (data.laborbasis) {
                const r = document.querySelector(`input[name="laborbasis"][value="${data.laborbasis}"]`);
                if (r) r.checked = true;
            }
            if (data.extraApprovalMethod) {
                const r = document.querySelector(`input[name="extraApprovalMethod"][value="${data.extraApprovalMethod}"]`);
                if (r) r.checked = true;
            }
            $('parts-entry').innerHTML = '';
            const parts = data.parts?.length ? data.parts : [null, null, null];
            parts.forEach((p) => addPart(p || undefined));
            $('repairs-entry').innerHTML = '';
            const repairs = data.repairs?.length ? data.repairs : [null, null];
            repairs.forEach((r) => addRepair(r || undefined));
            updateEstimate();
            updateSaveParts();
            updateLaborBasis();
            updateExtraApprovalMethod();
            updateTeardownSentence($('teardown').value);
            updateDocTitle($('estimateInvoice').value);
            maybeAutoTotal();
            return true;
        } catch (_) {
            return false;
        }
    }

    /* ---------- Exports ---------- */
    function fileBase() {
        const name = ($('name').value || 'authorization').replace(/[^\w\-]+/g, '_').slice(0, 40);
        const date = $('date').value || new Date().toISOString().slice(0, 10);
        return `RSG_${name}_${date}`;
    }

    function downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

    /** Force letter-page width so mobile viewport doesn't shrink the document */
    function withDesktopPaper(run) {
        const prev = {
            width: paper.style.width,
            maxWidth: paper.style.maxWidth,
            minWidth: paper.style.minWidth,
            margin: paper.style.margin,
            transform: paper.style.transform
        };
        paper.style.width = '816px';
        paper.style.maxWidth = '816px';
        paper.style.minWidth = '816px';
        paper.style.margin = '0 auto';
        paper.style.transform = '';

        const restore = () => {
            paper.style.width = prev.width;
            paper.style.maxWidth = prev.maxWidth;
            paper.style.minWidth = prev.minWidth;
            paper.style.margin = prev.margin;
            paper.style.transform = prev.transform;
        };

        return Promise.resolve()
            .then(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
            .then(() => run())
            .finally(restore);
    }

    async function renderPaperCanvas() {
        if (typeof html2canvas !== 'function') {
            throw new Error('Export library failed to load — check your connection');
        }
        return withDesktopPaper(async () => {
            const canvas = await html2canvas(paper, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false,
                scrollX: 0,
                scrollY: 0,
                windowWidth: 900,
                width: paper.scrollWidth,
                height: paper.scrollHeight
            });
            return canvas;
        });
    }

    async function exportPdf() {
        try {
            showToast('Generating PDF…');
            if (!window.jspdf?.jsPDF) throw new Error('PDF library failed to load');
            const canvas = await renderPaperCanvas();
            const img = canvas.toDataURL('image/jpeg', 0.95);
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });
            const pageW = pdf.internal.pageSize.getWidth();
            const pageH = pdf.internal.pageSize.getHeight();
            const margin = 28;
            const maxW = pageW - margin * 2;
            const maxH = pageH - margin * 2;
            const ratio = Math.min(maxW / canvas.width, maxH / canvas.height);
            const w = canvas.width * ratio;
            const h = canvas.height * ratio;
            pdf.addImage(img, 'JPEG', (pageW - w) / 2, margin, w, h);
            pdf.save(`${fileBase()}.pdf`);
            showToast('PDF downloaded');
        } catch (err) {
            console.error(err);
            showToast('PDF failed: ' + (err.message || 'unknown error'), true);
        }
    }

    async function exportImage() {
        try {
            showToast('Generating image…');
            const canvas = await renderPaperCanvas();
            const blob = await new Promise((resolve, reject) => {
                canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Empty image'))), 'image/png');
            });
            downloadBlob(blob, `${fileBase()}.png`);
            showToast('Image downloaded');
        } catch (err) {
            console.error(err);
            showToast('Image failed: ' + (err.message || 'unknown error'), true);
        }
    }

    function exportWord() {
        try {
            const clone = paper.cloneNode(true);
            const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>RSG Work Authorization</title>
            <style>
              body{font-family:Arial,sans-serif;font-size:11pt;color:#111}
              h2{text-align:center} table{border-collapse:collapse;width:100%}
              th,td{border:1px solid #333;padding:4px;vertical-align:top}
              .statutory-notice{border:2px solid #111;padding:10px;margin:8px 0;font-weight:700;text-transform:uppercase;font-size:10pt}
              .psection{border:1px solid #222;padding:8px;margin:6px 0}
            </style></head><body>${clone.innerHTML}</body></html>`;
            downloadBlob(new Blob(['\ufeff', html], { type: 'application/msword' }), `${fileBase()}.doc`);
            showToast('Word document downloaded');
        } catch (err) {
            console.error(err);
            showToast('Word export failed', true);
        }
    }

    function exportPrint() {
        const el = paper;
        const prev = {
            width: el.style.width,
            maxWidth: el.style.maxWidth,
            minWidth: el.style.minWidth,
            margin: el.style.margin,
            transform: el.style.transform
        };

        el.style.width = '7.7in';
        el.style.maxWidth = '7.7in';
        el.style.minWidth = '7.7in';
        el.style.margin = '0 auto';
        el.style.transform = '';

        const maxHeightPx = 10.0 * 96;

        requestAnimationFrame(() => {
            const rect = el.getBoundingClientRect();
            let scale = Math.min(1, maxHeightPx / Math.max(rect.height, 1));
            scale = Math.max(scale, 0.92);

            if (scale < 0.995) {
                el.style.transformOrigin = 'top center';
                el.style.transform = `scale(${scale})`;
            }

            const reset = () => {
                el.style.width = prev.width;
                el.style.maxWidth = prev.maxWidth;
                el.style.minWidth = prev.minWidth;
                el.style.margin = prev.margin;
                el.style.transform = prev.transform;
                window.removeEventListener('afterprint', reset);
            };
            window.addEventListener('afterprint', reset);
            window.print();
            setTimeout(reset, 2000);
        });
    }

    function onAction(action) {
        const map = {
            pdf: exportPdf,
            word: exportWord,
            image: exportImage,
            print: exportPrint,
            clear: clearForm
        };
        map[action]?.();
    }

    document.getElementById('export-bar').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (btn) onAction(btn.dataset.action);
    });

    document.querySelector('.panel-actions')?.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (btn) onAction(btn.dataset.action);
    });

    let saveTimer;
    document.querySelector('.panel')?.addEventListener('input', () => {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
            try { localStorage.setItem(DRAFT_KEY, JSON.stringify(collectData())); } catch (_) { /* ignore */ }
        }, 800);
    });
    document.querySelector('.panel')?.addEventListener('change', () => {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
            try { localStorage.setItem(DRAFT_KEY, JSON.stringify(collectData())); } catch (_) { /* ignore */ }
        }, 800);
    });

    /* ---------- Init ---------- */
    if (!loadDraft()) {
        addRepair();
        addRepair();
        addPart();
        addPart();
        addPart();
        setDefaults();
        updateEstimate();
        updateSaveParts();
        updateLaborBasis();
        updateExtraApprovalMethod();
        updateTeardownSentence('');
        updateDocTitle('');
        renderParts();
        renderRepairs();
    } else {
        showToast('Restored saved draft');
    }

    initAuth();
})();

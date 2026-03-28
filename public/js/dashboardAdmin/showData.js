// ========================== VARIABLES GLOBALES ==========================
let lavadosCargados = [];

// ========================== UTILS ==========================
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// ========================== FETCH ==========================
async function fetchLavados(adminId) {
    try {
        const res = await fetch(`/api/admins/${adminId}/lavados`);
        if (!res.ok) throw new Error('Error al obtener lavados');
        return await res.json();
    } catch (e) {
        console.error(e);
        return null;
    }
}

async function fetchLocalInfo(adminId) {
    try {
        const res = await fetch(`/api/locales/${encodeURIComponent(adminId)}`);
        if (!res.ok) return {};
        return await res.json();
    } catch (e) {
        return {};
    }
}

// ========================== DISPLAY ==========================
function displayLocalName(info) {
    const el = document.getElementById('localName');
    if (el && info.localName) el.textContent = info.localName;

    // Avatar inicial
    const avatar = document.getElementById('topbarAvatar');
    if (avatar && info.localName) avatar.textContent = info.localName.charAt(0).toUpperCase();
}

function displayCards(lavados) {
    const totalEl    = document.getElementById('totalPedidos');
    const clientEl   = document.getElementById('clientCount');

    if (totalEl)  totalEl.textContent  = lavados.length;

    // Clientes del día
    const hoy = new Date().toDateString();
    const delDia = lavados.filter(l => l.fechaDeAlta && new Date(l.fechaDeAlta).toDateString() === hoy);
    if (clientEl) clientEl.textContent = delDia.length;
}

function displayClientTable(lavados) {
    const tbody = document.getElementById('clientTableBody');
    if (!tbody) return;

    if (!lavados.length) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:32px">Sin clientes aún</td></tr>`;
        return;
    }

    tbody.innerHTML = lavados.slice(0, 20).map(l => {
        const puntuacion = l.puntuacionCalidad || 0;
        const stars = '★'.repeat(Math.round(puntuacion / 2)) + '☆'.repeat(5 - Math.round(puntuacion / 2));
        const badgeColor = l.estado === 'Completado'
            ? 'background:rgba(16,185,129,0.1);color:#10B981'
            : 'background:rgba(245,158,11,0.1);color:#F59E0B';

        return `
        <tr>
            <td>
                <div style="font-weight:600;color:var(--text-primary)">${l.nombre || '—'}</div>
                <div style="font-size:11px;color:var(--text-muted)">${l.modelo || ''}</div>
            </td>
            <td style="color:var(--text-secondary)">${l.from || '—'}</td>
            <td><span style="font-size:13px;color:#F59E0B;letter-spacing:1px">${stars}</span></td>
            <td>
                <span style="padding:3px 10px;border-radius:99px;font-size:11px;font-weight:600;${badgeColor}">
                    ${l.estado || 'Pendiente'}
                </span>
            </td>
        </tr>`;
    }).join('');
}

// ========================== CAJA CHICA ==========================
async function actualizarCajaChica() {
    try {
        const res = await fetch('/api/arqueosBalances?cajaTipo=CajaChica');
        if (!res.ok) return;
        const data = await res.json();
        if (!data.success) return;

        const ef = data.data.efectivo;
        const mp = data.data.mercadoPago;

        const efEl = document.getElementById('cajaChicaActualEfectivo');
        const mpEl = document.getElementById('cajaChicaActualMp');
        if (efEl) efEl.textContent = `$${(ef.balanceActual - ef.saldoInicial).toLocaleString('es-AR')}`;
        if (mpEl) mpEl.textContent = `$${(mp.balanceActual - mp.saldoInicial).toLocaleString('es-AR')}`;
    } catch (e) {
        // Silencioso si no existe el endpoint
    }
}

// ========================== INIT ==========================
document.addEventListener('DOMContentLoaded', async () => {
    const adminId = getCookie('adminId');
    if (!adminId) {
        console.warn('No se encontró adminId en cookies.');
        return;
    }

    const [lavados, localInfo] = await Promise.all([
        fetchLavados(adminId),
        fetchLocalInfo(adminId)
    ]);

    displayLocalName(localInfo);

    if (Array.isArray(lavados)) {
        lavadosCargados = lavados;
        displayCards(lavados);
        displayClientTable(lavados);
    }

    actualizarCajaChica();

    // ========================== CREAR USUARIO ==========================
    const form = document.querySelector('.form-create-user');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email    = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const role     = document.getElementById('role').value;

            try {
                const res = await fetch(`/api/admins/${adminId}/usuarios`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, role })
                });
                const data = await res.json();
                if (res.ok) {
                    alert(`✓ Usuario "${email}" creado correctamente`);
                    form.reset();
                } else {
                    alert(`Error: ${data.error}`);
                }
            } catch (err) {
                alert('Error de red al crear usuario');
            }
        });
    }
});

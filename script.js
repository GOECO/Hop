const storageLocations = [
  {
    id: crypto.randomUUID(),
    name: 'Kệ A1',
    type: 'shelf',
    capacity: 18,
    doors: 0,
  },
  {
    id: crypto.randomUUID(),
    name: 'Tủ thông minh 02',
    type: 'locker',
    capacity: 12,
    doors: 12,
  },
  {
    id: crypto.randomUUID(),
    name: 'Tủ lạnh 01',
    type: 'cooler',
    capacity: 6,
    doors: 4,
  },
];

const feePlans = [
  {
    id: crypto.randomUUID(),
    name: 'Nhận tại quầy',
    type: 'per-visit',
    price: 0,
  },
  {
    id: crypto.randomUUID(),
    name: 'Giao tận cửa',
    type: 'per-visit',
    price: 15000,
  },
  {
    id: crypto.randomUUID(),
    name: 'Thành viên giao tận cửa',
    type: 'monthly',
    price: 120000,
  },
];

const onPayWallet = {
  id: 'HOP-ONPAY-0928',
  balance: 220000,
  history: [
    {
      id: crypto.randomUUID(),
      type: 'topup',
      amount: 200000,
      note: 'Nạp qua thẻ nội địa',
      at: Date.now() - 4 * 60 * 60 * 1000,
    },
    {
      id: crypto.randomUUID(),
      type: 'payment',
      amount: 15000,
      note: 'Thanh toán giao tận cửa',
      at: Date.now() - 2 * 60 * 60 * 1000,
    },
  ],
};

const now = Date.now();

const deliveries = [
  {
    id: crypto.randomUUID(),
    recipient: 'Nguyễn Văn A',
    apartment: 'B2-1205',
    courier: 'Giao Hàng Nhanh',
    notes: 'Hàng dễ vỡ',
    waybillCode: 'GHN123456789',
    status: 'waiting',
    storageId: storageLocations[0].id,
    billingPlanId: feePlans[0].id,
    createdAt: now - 45 * 60 * 1000,
    notifiedAt: null,
    pickedAt: null,
    doorRequestedAt: null,
    waybillPhoto:
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=400&q=80',
    packagePhoto: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
    pickupPhoto: null,
    payment: {
      method: 'onpay',
      status: 'paid',
      amount: feePlans[0].price,
      transactionId: null,
    },
  },
  {
    id: crypto.randomUUID(),
    recipient: 'Trần Thu Hà',
    apartment: 'A1-1808',
    courier: 'GrabExpress',
    notes: 'Thực phẩm tươi – cần giữ lạnh',
    waybillCode: 'GRB998877665',
    status: 'door',
    storageId: storageLocations[1].id,
    billingPlanId: feePlans[1].id,
    createdAt: now - 3 * 60 * 60 * 1000,
    notifiedAt: now - 2 * 60 * 60 * 1000,
    pickedAt: null,
    doorRequestedAt: now - 30 * 60 * 1000,
    waybillPhoto:
      'https://images.unsplash.com/photo-1542834369-f10ebf06d3cb?auto=format&fit=crop&w=400&q=80',
    packagePhoto: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&w=400&q=80',
    pickupPhoto: null,
    payment: {
      method: 'onpay',
      status: 'pending',
      amount: feePlans[1].price,
      transactionId: null,
    },
  },
  {
    id: crypto.randomUUID(),
    recipient: 'Gia đình Phan',
    apartment: 'C3-0602',
    courier: 'VNPost',
    notes: 'Tài liệu cần chữ ký cư dân',
    waybillCode: 'VNPT5566778899',
    status: 'picked',
    storageId: storageLocations[2].id,
    billingPlanId: feePlans[2].id,
    createdAt: now - 20 * 60 * 60 * 1000,
    notifiedAt: now - 19 * 60 * 60 * 1000,
    pickedAt: now - 2 * 60 * 60 * 1000,
    doorRequestedAt: null,
    waybillPhoto:
      'https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=400&q=80',
    packagePhoto: 'https://images.unsplash.com/photo-1596207498810-9f8380cdb236?auto=format&fit=crop&w=400&q=80',
    pickupPhoto: 'https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=400&q=80',
    payment: {
      method: 'onpay',
      status: 'subscription',
      amount: feePlans[2].price,
      transactionId: 'ONPAY-MEM-8891',
    },
  },
  {
    id: crypto.randomUUID(),
    recipient: 'Phạm Quốc Bảo',
    apartment: 'D1-0707',
    courier: 'Lalamove',
    notes: 'Thiết bị điện tử giá trị',
    waybillCode: 'LLM44556677',
    status: 'notified',
    storageId: storageLocations[0].id,
    billingPlanId: feePlans[1].id,
    createdAt: now - 6 * 60 * 60 * 1000,
    notifiedAt: now - 5 * 60 * 60 * 1000,
    pickedAt: null,
    doorRequestedAt: null,
    waybillPhoto:
      'https://images.unsplash.com/photo-1515169132745-7c7e8f11db4d?auto=format&fit=crop&w=400&q=80',
    packagePhoto: 'https://images.unsplash.com/photo-1515169067865-5387ec356754?auto=format&fit=crop&w=400&q=80',
    pickupPhoto: null,
    payment: {
      method: 'onpay',
      status: 'pending',
      amount: feePlans[1].price,
      transactionId: null,
    },
  },
];

const statusLabels = {
  waiting: 'Chờ cư dân',
  notified: 'Đã thông báo',
  door: 'Chờ giao tận cửa',
  picked: 'Đã nhận',
};

const deliveriesBody = document.querySelector('#deliveries-body');
const rowTemplate = document.querySelector('#delivery-row-template');
const statWaiting = document.querySelector('#stat-waiting');
const statToday = document.querySelector('#stat-today');
const statOverdue = document.querySelector('#stat-overdue');
const form = document.querySelector('#new-delivery-form');
const statusFilter = document.querySelector('#status-filter');
const sortOrder = document.querySelector('#sort-order');
const storageSelect = document.querySelector('#storage-select');
const billingPlanSelect = document.querySelector('#billing-plan-select');
const storageBody = document.querySelector('#storage-body');
const feePlanBody = document.querySelector('#fee-plan-body');
const storageForm = document.querySelector('#new-storage-form');
const feeForm = document.querySelector('#new-fee-form');
const residentCard = document.querySelector('#resident-active-card');
const residentQueue = document.querySelector('#resident-queue');
const residentHistory = document.querySelector('#resident-history');
const residentMeta = document.querySelector('#resident-meta');
const staffTaskList = document.querySelector('#staff-task-list');
const staffMeta = document.querySelector('#staff-meta');
const staffStorage = document.querySelector('#staff-storage');
const appToast = document.querySelector('#app-toast');
const mediaModal = document.querySelector('#media-modal');
const mediaModalBody = document.querySelector('#media-modal-body');
const pickupModal = document.querySelector('#pickup-modal');
const pickupForm = document.querySelector('#pickup-form');
const pickupPhotoInput = document.querySelector('#pickup-photo');
const pickupPreview = document.querySelector('#pickup-photo-preview');
const pickupPreviewImg = document.querySelector('#pickup-photo-preview-img');
const pickupAmountDisplay = document.querySelector('#pickup-amount');
const pickupWalletBalance = document.querySelector('#pickup-wallet-balance');
const pickupTopupAmount = document.querySelector('#pickup-topup-amount');
const pickupTopupButton = document.querySelector('#pickup-topup-button');
const walletBalanceDisplay = document.querySelector('#wallet-balance-display');
const walletIdDisplay = document.querySelector('#wallet-id-display');
const walletHistoryList = document.querySelector('#wallet-history');
const walletTopupForm = document.querySelector('#wallet-topup-form');
const walletTopupAmountInput = document.querySelector('#wallet-topup-amount');
const modalCloseButtons = document.querySelectorAll('[data-close-modal]');

let toastTimeout;
let activePickupId = null;
let pickupPreviewUrl = null;

if (appToast) {
  appToast.setAttribute('aria-hidden', 'true');
}

const showToast = (message) => {
  if (!appToast) return;
  appToast.textContent = message;
  appToast.hidden = false;
  appToast.setAttribute('aria-hidden', 'false');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    appToast.setAttribute('aria-hidden', 'true');
    appToast.hidden = true;
  }, 3200);
};

const openModal = (modal) => {
  if (!modal) return;
  modal.hidden = false;
  modal.setAttribute('aria-hidden', 'false');
};

const closeModal = (modal) => {
  if (!modal) return;
  modal.hidden = true;
  modal.setAttribute('aria-hidden', 'true');
};

const readFileAsDataURL = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result));
    reader.addEventListener('error', () => reject(reader.error));
    reader.readAsDataURL(file);
  });

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);

const formatPlanType = (type) =>
  type === 'monthly' ? 'Theo tháng' : 'Theo lượt';

const getStorageById = (id) => storageLocations.find((item) => item.id === id);
const getPlanById = (id) => feePlans.find((item) => item.id === id);

const paymentStatusLabels = {
  pending: 'Chờ OnPay',
  paid: 'Đã thanh toán',
  subscription: 'Gói tháng OnPay',
};

const createPaymentRecord = (plan) => {
  if (!plan) {
    return { method: 'onpay', status: 'pending', amount: 0, transactionId: null };
  }

  if (plan.type === 'monthly') {
    return {
      method: 'onpay',
      status: 'subscription',
      amount: plan.price,
      transactionId: null,
    };
  }

  if (plan.price === 0) {
    return { method: 'onpay', status: 'paid', amount: 0, transactionId: null };
  }

  return { method: 'onpay', status: 'pending', amount: plan.price, transactionId: null };
};

const ensurePaymentRecord = (delivery) => {
  if (!delivery.payment) {
    delivery.payment = createPaymentRecord(getPlanById(delivery.billingPlanId));
  }
  return delivery.payment;
};

const formatPaymentLabel = (payment) => paymentStatusLabels[payment.status] || 'Chưa rõ';

const formatPaymentDetail = (payment) => {
  if (!payment) return 'Chưa thiết lập';
  if (payment.status === 'pending') {
    return `Chờ thanh toán ${formatCurrency(payment.amount)}`;
  }
  if (payment.status === 'paid') {
    return payment.transactionId
      ? `Đã thanh toán · ${payment.transactionId}`
      : 'Đã thanh toán';
  }
  if (payment.status === 'subscription') {
    return `Bao gồm gói tháng ${formatCurrency(payment.amount)}`;
  }
  return payment.status;
};

const formatPaymentMethod = (payment) =>
  payment && payment.method ? (payment.method === 'onpay' ? 'OnPay' : payment.method) : '—';

const getStorageUsage = (storageId) =>
  deliveries.filter((delivery) => delivery.storageId === storageId && delivery.status !== 'picked').length;

const formatRelativeTime = (timestamp) => {
  const nowDate = new Date();
  const created = new Date(timestamp);
  const diffMs = nowDate - created;
  const diffMinutes = Math.round(diffMs / 60000);

  if (diffMinutes < 1) return 'Vừa xong';
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} ngày trước`;
};

const formatStorageType = (type) =>
  type === 'shelf' ? 'Kệ' : type === 'locker' ? 'Tủ' : 'Tủ lạnh';

const formatStorageLabel = (storage) => {
  if (!storage) return '—';
  return `${storage.name} · ${formatStorageType(storage.type)}`;
};

const computeStats = () => {
  const nowDate = new Date();
  const startOfDay = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate());
  const waiting = deliveries.filter((d) => d.status !== 'picked').length;
  const completedToday = deliveries.filter(
    (d) => d.pickedAt && d.pickedAt >= startOfDay.getTime()
  ).length;
  const overdue = deliveries.filter((d) => {
    if (d.status === 'picked') return false;
    const created = new Date(d.createdAt);
    const hours = (nowDate - created) / 36e5;
    return hours >= 24;
  }).length;

  statWaiting.textContent = waiting;
  statToday.textContent = completedToday;
  statOverdue.textContent = overdue;
};

const createActionButton = (label, className, handler) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `action-btn ${className}`.trim();
  button.textContent = label;
  button.addEventListener('click', handler);
  return button;
};

const renderTable = () => {
  deliveriesBody.innerHTML = '';
  let filtered = deliveries.slice();

  if (statusFilter.value !== 'all') {
    filtered = filtered.filter((d) => d.status === statusFilter.value);
  }

  filtered.sort((a, b) =>
    sortOrder.value === 'asc' ? a.createdAt - b.createdAt : b.createdAt - a.createdAt
  );

  filtered.forEach((delivery) => {
    const row = rowTemplate.content.firstElementChild.cloneNode(true);
    const storage = getStorageById(delivery.storageId);
    const plan = getPlanById(delivery.billingPlanId);
    const payment = ensurePaymentRecord(delivery);

    row.querySelector('.delivery__time').textContent = formatTime(delivery.createdAt);
    row.querySelector(
      '.delivery__recipient'
    ).innerHTML = `<div class="cell-main">${delivery.recipient}</div><div class="cell-sub">${formatRelativeTime(
      delivery.createdAt
    )}</div>`;
    row.querySelector('.delivery__apartment').textContent = delivery.apartment;
    row.querySelector('.delivery__courier').textContent = delivery.courier;
    const waybillCell = row.querySelector('.delivery__waybill');
    waybillCell.innerHTML = '';
    if (delivery.waybillCode) {
      const codeBadge = document.createElement('span');
      codeBadge.className = 'waybill-chip';
      codeBadge.textContent = delivery.waybillCode;
      waybillCell.append(codeBadge);

      const meta = document.createElement('div');
      meta.className = 'cell-sub';
      if (delivery.waybillPhoto) {
        meta.append(document.createTextNode('Đã chụp mã vận đơn · '));
        const linkBtn = document.createElement('button');
        linkBtn.type = 'button';
        linkBtn.className = 'link-button';
        linkBtn.textContent = 'Xem ảnh mã';
        linkBtn.addEventListener('click', () => openMediaModal(delivery.id));
        meta.append(linkBtn);
      } else {
        meta.textContent = 'Chưa có ảnh mã';
      }
      waybillCell.append(meta);
    } else {
      waybillCell.textContent = '—';
    }
    row.querySelector('.delivery__storage').innerHTML = storage
      ? `<span class="tag" data-type="${storage.type}">${storage.name}</span>`
      : '—';

    row.querySelector('.delivery__plan').innerHTML = plan
      ? `<div class="plan-pill" data-billing="${plan.type}">${plan.name}</div><div class="cell-sub">${formatPlanType(
          plan.type
        )} · ${formatCurrency(plan.price)}</div>`
      : '—';

    const mediaCell = row.querySelector('.delivery__media');
    mediaCell.innerHTML = '';
    if (delivery.packagePhoto || delivery.pickupPhoto || delivery.waybillPhoto) {
      const mediaButton = document.createElement('button');
      mediaButton.type = 'button';
      mediaButton.className = 'action-btn action-btn--ghost';
      mediaButton.textContent = 'Xem chứng từ';
      mediaButton.addEventListener('click', () => openMediaModal(delivery.id));
      mediaCell.append(mediaButton);
    } else {
      mediaCell.textContent = '—';
    }

    const paymentCell = row.querySelector('.delivery__payment');
    paymentCell.innerHTML = '';
    if (payment) {
      paymentCell.innerHTML = `
        <span class="payment-pill" data-status="${payment.status}">${formatPaymentLabel(payment)}</span>
        <div class="cell-sub">${formatPaymentMethod(payment)}${
        payment.amount ? ` · ${formatCurrency(payment.amount)}` : ''
      }</div>
        ${payment.transactionId ? `<div class="cell-sub">Mã GD: ${payment.transactionId}</div>` : ''}
      `;
    } else {
      paymentCell.textContent = '—';
    }

    row.querySelector('.delivery__notes').textContent = delivery.notes || '—';

    const statusPill = document.createElement('span');
    statusPill.className = 'status-pill';
    statusPill.dataset.status = delivery.status;
    statusPill.textContent = statusLabels[delivery.status];
    row.querySelector('.delivery__status').append(statusPill);

    const actionsCell = row.querySelector('.delivery__actions');
    actionsCell.innerHTML = '';

    if (delivery.status === 'waiting') {
      actionsCell.append(
        createActionButton('Đánh dấu đã báo', '', () => updateStatus(delivery.id, 'notified'))
      );
    }

    if (delivery.status === 'waiting' || delivery.status === 'notified') {
      actionsCell.append(
        createActionButton('Giao tận cửa', '', () => updateStatus(delivery.id, 'door'))
      );
    }

    if (delivery.status !== 'picked') {
      actionsCell.append(
        createActionButton(
          payment && payment.status === 'pending' ? 'Thanh toán & nhận' : 'Đã nhận',
          'action-btn--primary',
          () => startPickup(delivery.id)
        )
      );
    }

    if (storage && storage.type !== 'shelf') {
      actionsCell.append(
        createActionButton('Mở tủ', 'action-btn--ghost', () => openStorage(delivery.id))
      );
    }

    deliveriesBody.append(row);
  });
};

const renderStorageOptions = () => {
  if (!storageSelect) return;
  const currentValue = storageSelect.value;
  storageSelect.innerHTML = storageLocations
    .map((storage) => `<option value="${storage.id}">${formatStorageLabel(storage)}</option>`)
    .join('');
  if (!storageLocations.length) return;
  const hasCurrent = storageLocations.some((storage) => storage.id === currentValue);
  storageSelect.value = hasCurrent ? currentValue : storageLocations[0].id;
};

const renderBillingOptions = () => {
  if (!billingPlanSelect) return;
  const currentValue = billingPlanSelect.value;
  billingPlanSelect.innerHTML = feePlans
    .map(
      (plan) =>
        `<option value="${plan.id}">${plan.name} · ${formatPlanType(plan.type)} (${formatCurrency(
          plan.price
        )})</option>`
    )
    .join('');
  if (!feePlans.length) return;
  const hasCurrent = feePlans.some((plan) => plan.id === currentValue);
  billingPlanSelect.value = hasCurrent ? currentValue : feePlans[0].id;
};

const renderStorageList = () => {
  if (!storageBody) return;
  storageBody.innerHTML = '';

  if (!storageLocations.length) {
    const emptyRow = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 4;
    cell.textContent = 'Chưa có vị trí lưu trữ.';
    emptyRow.append(cell);
    storageBody.append(emptyRow);
    return;
  }

  storageLocations.forEach((storage) => {
    const row = document.createElement('tr');
    const usage = getStorageUsage(storage.id);
    row.innerHTML = `
      <td>${storage.name}</td>
      <td>${formatStorageType(storage.type)}</td>
      <td>${storage.capacity}</td>
      <td>${usage}/${storage.capacity}</td>
    `;
    storageBody.append(row);
  });
};

const renderFeePlans = () => {
  if (!feePlanBody) return;
  feePlanBody.innerHTML = '';

  if (!feePlans.length) {
    const emptyRow = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 3;
    cell.textContent = 'Chưa có gói phí.';
    emptyRow.append(cell);
    feePlanBody.append(emptyRow);
    return;
  }

  feePlans.forEach((plan) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${plan.name}</td>
      <td>${formatPlanType(plan.type)}</td>
      <td>${formatCurrency(plan.price)}</td>
    `;
    feePlanBody.append(row);
  });
};

const openStorage = (deliveryId) => {
  const delivery = deliveries.find((item) => item.id === deliveryId);
  if (!delivery) return;
  const storage = getStorageById(delivery.storageId);
  if (!storage) return;
  const label = storage.type === 'shelf' ? 'kệ' : storage.type === 'locker' ? 'tủ' : 'tủ lạnh';
  showToast(`Đã mở ${label} ${storage.name} cho ${delivery.recipient}.`);
};

const recordWalletEntry = (type, amount, note, transactionId = null) => {
  onPayWallet.history.unshift({
    id: crypto.randomUUID(),
    type,
    amount,
    note,
    transactionId,
    at: Date.now(),
  });
  if (onPayWallet.history.length > 15) {
    onPayWallet.history.length = 15;
  }
};

const renderWallet = () => {
  if (walletBalanceDisplay) {
    walletBalanceDisplay.textContent = formatCurrency(onPayWallet.balance);
  }
  if (walletIdDisplay) {
    walletIdDisplay.textContent = onPayWallet.id;
  }
  if (pickupWalletBalance) {
    pickupWalletBalance.textContent = formatCurrency(onPayWallet.balance);
  }
  if (walletHistoryList) {
    walletHistoryList.innerHTML = '';
    if (!onPayWallet.history.length) {
      walletHistoryList.innerHTML = '<li class="wallet__history-empty">Chưa có giao dịch.</li>';
    } else {
      onPayWallet.history.slice(0, 5).forEach((entry) => {
        const item = document.createElement('li');
        item.className = 'wallet__history-item';
        const sign = entry.type === 'topup' ? '+' : '-';
        const label = entry.type === 'topup' ? 'Nạp OnPay' : 'Thanh toán';
        item.innerHTML = `
          <div class="wallet__history-amount">${sign}${formatCurrency(entry.amount)}</div>
          <div class="wallet__history-note">${label} · ${entry.note}</div>
          <div class="wallet__history-meta">${formatRelativeTime(entry.at)}${
          entry.transactionId ? ` · ${entry.transactionId}` : ''
        }</div>
        `;
        walletHistoryList.append(item);
      });
    }
  }
};

const topUpWallet = (amount, note = 'Nạp ví OnPay') => {
  if (!amount || Number.isNaN(amount) || amount <= 0) {
    return false;
  }
  onPayWallet.balance += amount;
  recordWalletEntry('topup', amount, note);
  renderWallet();
  return true;
};

const chargeWallet = (amount, note) => {
  if (!amount || Number.isNaN(amount) || amount <= 0) {
    return { success: true, transactionId: null };
  }
  if (onPayWallet.balance < amount) {
    return { success: false, transactionId: null };
  }
  onPayWallet.balance -= amount;
  const transactionId = `ONPAY-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  recordWalletEntry('payment', amount, note, transactionId);
  renderWallet();
  return { success: true, transactionId };
};

const openMediaModal = (deliveryId) => {
  if (!mediaModal || !mediaModalBody) return;
  const delivery = deliveries.find((item) => item.id === deliveryId);
  if (!delivery) return;
  const payment = ensurePaymentRecord(delivery);

  mediaModalBody.innerHTML = `
    <div class="modal__gallery">
      <div class="modal__gallery-item">
        <h4>Mã vận đơn</h4>
        ${
          delivery.waybillPhoto
            ? `<img src="${delivery.waybillPhoto}" alt="Ảnh mã vận đơn của ${delivery.recipient}" />`
            : '<p class="modal__empty">Chưa có ảnh mã vận đơn.</p>'
        }
        ${delivery.waybillCode ? `<code class="modal__code">${delivery.waybillCode}</code>` : ''}
      </div>
      <div class="modal__gallery-item">
        <h4>Khi gửi</h4>
        ${
          delivery.packagePhoto
            ? `<img src="${delivery.packagePhoto}" alt="Ảnh kiện khi gửi của ${delivery.recipient}" />`
            : '<p class="modal__empty">Chưa có ảnh lúc gửi.</p>'
        }
      </div>
      <div class="modal__gallery-item">
        <h4>Khi nhận</h4>
        ${
          delivery.pickupPhoto
            ? `<img src="${delivery.pickupPhoto}" alt="Ảnh xác nhận nhận hàng của ${delivery.recipient}" />`
            : '<p class="modal__empty">Chưa có ảnh lúc nhận.</p>'
        }
      </div>
    </div>
    <dl class="modal__details">
      <div>
        <dt>Mã vận đơn</dt>
        <dd>${delivery.waybillCode || '—'}</dd>
      </div>
      <div>
        <dt>Cư dân</dt>
        <dd>${delivery.recipient} · ${delivery.apartment}</dd>
      </div>
      <div>
        <dt>Thanh toán</dt>
        <dd>${formatPaymentDetail(payment)}</dd>
      </div>
      <div>
        <dt>Phương thức</dt>
        <dd>${formatPaymentMethod(payment)}</dd>
      </div>
    </dl>
  `;

  openModal(mediaModal);
};

const resetPickupModal = () => {
  if (pickupForm) {
    pickupForm.reset();
  }
  if (pickupPhotoInput) {
    pickupPhotoInput.value = '';
  }
  if (pickupPreview && pickupPreviewImg) {
    pickupPreview.hidden = true;
    pickupPreviewImg.src = '';
  }
  if (pickupTopupAmount) {
    pickupTopupAmount.value = '';
  }
  if (pickupPreviewUrl) {
    URL.revokeObjectURL(pickupPreviewUrl);
    pickupPreviewUrl = null;
  }
  activePickupId = null;
};

const closePickupModal = () => {
  resetPickupModal();
  closeModal(pickupModal);
};

const startPickup = (deliveryId) => {
  if (!pickupModal) return;
  const delivery = deliveries.find((item) => item.id === deliveryId);
  if (!delivery) return;
  const payment = ensurePaymentRecord(delivery);
  const amountDue = payment && payment.status === 'pending' ? payment.amount : 0;

  resetPickupModal();
  activePickupId = deliveryId;

  if (pickupAmountDisplay) {
    pickupAmountDisplay.textContent = formatCurrency(amountDue);
  }
  if (pickupWalletBalance) {
    pickupWalletBalance.textContent = formatCurrency(onPayWallet.balance);
  }
  if (pickupTopupAmount) {
    pickupTopupAmount.value = amountDue && onPayWallet.balance < amountDue ? amountDue - onPayWallet.balance : '';
  }

  openModal(pickupModal);
};

const renderResidentApp = () => {
  if (!residentCard) return;
  const waitingDeliveries = deliveries.filter((delivery) => delivery.status !== 'picked');

  if (!waitingDeliveries.length) {
    residentMeta.textContent = 'Không có kiện chờ';
    residentCard.innerHTML = '<p>Chưa có kiện hàng nào cần xử lý.</p>';
    residentQueue.innerHTML = '';
    residentHistory.innerHTML = '<li class="is-empty">Chưa có lịch sử</li>';
    return;
  }

  const active = waitingDeliveries[0];
  const storage = getStorageById(active.storageId);
  const plan = getPlanById(active.billingPlanId);
  const payment = ensurePaymentRecord(active);
  const confirmLabel =
    payment && payment.status === 'pending' ? 'Thanh toán & nhận' : 'Xác nhận đã nhận';
  const packageMedia = active.packagePhoto
    ? `<figure class="phone-card__media"><img src="${active.packagePhoto}" alt="Ảnh kiện hàng của ${active.recipient}" /></figure>`
    : '';
  const waybillLine = `
      <li><strong>Mã vận đơn:</strong> ${
        active.waybillCode
          ? `<span class="waybill-chip">${active.waybillCode}</span>${
              active.waybillPhoto
                ? ' · <button class="link-button" type="button" data-action="waybill">Xem ảnh mã</button>'
                : ''
            }`
          : '—'
      }</li>`;
  residentMeta.textContent = `${waitingDeliveries.length} kiện chờ`;

  residentCard.innerHTML = `
    <header class="phone-card__header">
      <div>
        <p class="phone-card__title">${active.recipient}</p>
        <p class="phone-card__tag">${active.apartment}</p>
      </div>
      <span>${statusLabels[active.status]}</span>
    </header>
    ${packageMedia}
    <p>${storage ? formatStorageLabel(storage) : 'Không rõ vị trí'}</p>
    <ul class="phone-card__details">
      <li><strong>Đơn vị:</strong> ${active.courier}</li>
      ${waybillLine}
      <li><strong>Gói phí:</strong> ${plan ? plan.name : '—'}${
        plan ? ` · ${formatPlanType(plan.type)} · ${formatCurrency(plan.price)}` : ''
      }</li>
      ${active.notes ? `<li><strong>Ghi chú:</strong> ${active.notes}</li>` : ''}
      <li><strong>Thanh toán:</strong> ${formatPaymentDetail(payment)}</li>
      <li><strong>Số dư OnPay:</strong> ${formatCurrency(onPayWallet.balance)}</li>
    </ul>
    <div class="phone-actions">
      <button class="phone-btn phone-btn--primary" data-action="confirm">${confirmLabel}</button>
      ${
        active.status !== 'door'
          ? '<button class="phone-btn phone-btn--secondary" data-action="door">Yêu cầu giao tận cửa</button>'
          : ''
      }
      ${
        storage && storage.type !== 'shelf'
          ? `<button class="phone-btn phone-btn--ghost" data-action="open">Mở ${
              storage.type === 'locker' ? 'tủ' : 'khoang'
            }</button>`
          : ''
      }
    </div>
    <p class="phone-card__foot">${formatRelativeTime(active.createdAt)} · ${
    statusLabels[active.status]
  }</p>
  `;

  residentCard.querySelector('[data-action="confirm"]').addEventListener('click', () =>
    startPickup(active.id)
  );

  const waybillButton = residentCard.querySelector('[data-action="waybill"]');
  if (waybillButton) {
    waybillButton.addEventListener('click', () => openMediaModal(active.id));
  }

  const doorButton = residentCard.querySelector('[data-action="door"]');
  if (doorButton) {
    doorButton.addEventListener('click', () => updateStatus(active.id, 'door'));
  }

  const openButton = residentCard.querySelector('[data-action="open"]');
  if (openButton) {
    openButton.addEventListener('click', () => openStorage(active.id));
  }

  residentQueue.innerHTML = '';
  waitingDeliveries.slice(1, 4).forEach((delivery) => {
    const storageRef = getStorageById(delivery.storageId);
    const item = document.createElement('div');
    item.className = 'phone-item';
    item.innerHTML = `
      <div class="phone-item__header">
        <span>${delivery.recipient}</span>
        <span class="phone-item__meta">${formatRelativeTime(delivery.createdAt)}</span>
      </div>
      <div class="phone-item__meta">${storageRef ? storageRef.name : 'Chưa gán vị trí'}</div>
      <div class="phone-item__meta">${statusLabels[delivery.status]}</div>
    `;
    residentQueue.append(item);
  });

  if (!residentQueue.children.length) {
    const empty = document.createElement('div');
    empty.className = 'phone-item';
    empty.innerHTML = '<div class="phone-item__meta">Không có thêm kiện nào.</div>';
    residentQueue.append(empty);
  }

  const historyItems = deliveries
    .filter((delivery) => delivery.recipient === active.recipient && delivery.status === 'picked')
    .sort((a, b) => b.pickedAt - a.pickedAt)
    .slice(0, 3);

  residentHistory.innerHTML = '';

  if (!historyItems.length) {
    residentHistory.innerHTML = '<li class="is-empty">Chưa có lịch sử</li>';
  } else {
    historyItems.forEach((delivery) => {
      residentHistory.innerHTML += `
        <li>
          <span>${formatTime(delivery.pickedAt)} · ${delivery.apartment}</span>
          <span>${statusLabels[delivery.status]}</span>
        </li>
      `;
    });
  }
};

const renderStaffStorage = () => {
  if (!staffStorage) return;
  staffStorage.innerHTML = '';

  storageLocations.forEach((storage) => {
    const usage = getStorageUsage(storage.id);
    const capacity = Math.max(storage.capacity, 1);
    const percent = Math.min(100, Math.round((usage / capacity) * 100));
    const item = document.createElement('li');
    item.innerHTML = `
      <div class="storage-progress">
        <div class="phone-item__header">
          <span>${storage.name}</span>
          <span class="phone-item__meta">${usage}/${storage.capacity}</span>
        </div>
        <div class="storage-progress__bar"><span style="width: ${percent}%"></span></div>
      </div>
    `;
    staffStorage.append(item);
  });
};

const renderStaffTasks = () => {
  if (!staffTaskList) return;
  staffTaskList.innerHTML = '';
  const activeTasks = deliveries.filter((delivery) => delivery.status !== 'picked');
  staffMeta.textContent = `${activeTasks.length} nhiệm vụ`;

  if (!activeTasks.length) {
    staffTaskList.innerHTML = '<p class="phone-item__meta">Không có nhiệm vụ nào.</p>';
    return;
  }

  activeTasks.slice(0, 4).forEach((task) => {
    const storage = getStorageById(task.storageId);
    const plan = getPlanById(task.billingPlanId);
    const payment = ensurePaymentRecord(task);
    const card = document.createElement('div');
    card.className = 'phone-card';
    card.innerHTML = `
      <div class="phone-card__header">
        <div>
          <p class="phone-card__title">${task.recipient}</p>
          <p class="phone-card__tag">${task.apartment}</p>
        </div>
        <span>${statusLabels[task.status]}</span>
      </div>
      <p>${storage ? formatStorageLabel(storage) : 'Chưa gán vị trí'}</p>
      <p class="phone-item__meta">${plan ? plan.name : '—'}${
      plan ? ` · ${formatPlanType(plan.type)}` : ''
    }</p>
      <p class="phone-item__meta">Mã: ${
        task.waybillCode
          ? `<span class="waybill-chip">${task.waybillCode}</span>${
              task.waybillPhoto
                ? ' · <button class="link-button" type="button" data-task-waybill="${task.id}">Xem ảnh mã</button>'
                : ''
            }`
          : '—'
      }</p>
      <p class="phone-item__meta">Thanh toán: ${formatPaymentDetail(payment)}</p>
      <div class="phone-actions"></div>
    `;

    const actions = card.querySelector('.phone-actions');

    if (task.status === 'waiting') {
      const notifyBtn = document.createElement('button');
      notifyBtn.className = 'phone-btn phone-btn--secondary';
      notifyBtn.textContent = 'Đã báo cư dân';
      notifyBtn.addEventListener('click', () => updateStatus(task.id, 'notified'));
      actions.append(notifyBtn);
    }

    if (task.status === 'waiting' || task.status === 'notified') {
      const doorBtn = document.createElement('button');
      doorBtn.className = 'phone-btn phone-btn--ghost';
      doorBtn.textContent = 'Chuyển giao tận cửa';
      doorBtn.addEventListener('click', () => updateStatus(task.id, 'door'));
      actions.append(doorBtn);
    }

    const completeBtn = document.createElement('button');
    completeBtn.className = 'phone-btn phone-btn--primary';
    completeBtn.textContent = payment && payment.status === 'pending' ? 'Thanh toán & giao' : 'Hoàn tất';
    completeBtn.addEventListener('click', () => startPickup(task.id));
    actions.append(completeBtn);

    if (storage && storage.type !== 'shelf') {
      const openBtn = document.createElement('button');
      openBtn.className = 'phone-btn phone-btn--ghost';
      openBtn.textContent = 'Mở tủ';
      openBtn.addEventListener('click', () => openStorage(task.id));
      actions.append(openBtn);
    }

    const waybillBtn = card.querySelector('[data-task-waybill]');
    if (waybillBtn) {
      waybillBtn.addEventListener('click', () => openMediaModal(task.id));
    }

    staffTaskList.append(card);
  });
};

const renderMobileApps = () => {
  renderResidentApp();
  renderStaffTasks();
  renderStaffStorage();
};

const refreshDeliveries = () => {
  computeStats();
  renderTable();
  renderStorageList();
  renderMobileApps();
  renderWallet();
};

const updateStatus = (id, status, extras = {}) => {
  const delivery = deliveries.find((item) => item.id === id);
  if (!delivery) return;

  delivery.status = status;
  const nowTime = Date.now();
  let toastMessage = '';

  if (status === 'notified') {
    delivery.notifiedAt = nowTime;
    toastMessage = `Đã thông báo cư dân ${delivery.recipient}.`;
  }

  if (status === 'door') {
    delivery.doorRequestedAt = nowTime;
    toastMessage = `Ghi nhận yêu cầu giao tận cửa cho ${delivery.recipient}.`;
  }

  if (status === 'picked') {
    delivery.pickedAt = nowTime;
    const payment = ensurePaymentRecord(delivery);

    if (extras.pickupPhoto) {
      delivery.pickupPhoto = extras.pickupPhoto;
    }

    if (extras.payment) {
      delivery.payment = { ...payment, ...extras.payment };
    } else {
      delivery.payment = payment;
      if (delivery.payment.status === 'pending' && delivery.payment.amount === 0) {
        delivery.payment.status = 'paid';
      }
    }

    toastMessage =
      extras.payment && extras.payment.status === 'paid'
        ? `Thanh toán OnPay thành công cho ${delivery.recipient}.`
        : `Hoàn tất giao cho ${delivery.recipient}.`;
  }

  if (toastMessage) {
    showToast(toastMessage);
  }

  refreshDeliveries();
};

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(form);

  const waybillCode = (formData.get('waybillCode') || '').trim();
  if (!waybillCode) {
    showToast('Vui lòng nhập mã vận đơn.');
    return;
  }

  let waybillPhoto = null;
  const waybillFile = formData.get('waybillPhoto');
  if (waybillFile && waybillFile.size) {
    try {
      waybillPhoto = await readFileAsDataURL(waybillFile);
    } catch (error) {
      showToast('Không thể tải ảnh mã vận đơn. Vui lòng thử lại.');
      return;
    }
  } else {
    showToast('Vui lòng chụp ảnh mã vận đơn.');
    return;
  }

  let packagePhoto = null;
  const packageFile = formData.get('packagePhoto');
  if (packageFile && packageFile.size) {
    try {
      packagePhoto = await readFileAsDataURL(packageFile);
    } catch (error) {
      showToast('Không thể tải ảnh kiện hàng. Vui lòng thử lại.');
      return;
    }
  }

  const billingId = formData.get('billing');
  const plan = getPlanById(billingId);
  const payment = createPaymentRecord(plan);

  deliveries.unshift({
    id: crypto.randomUUID(),
    recipient: formData.get('recipient'),
    apartment: formData.get('apartment'),
    courier: formData.get('courier'),
    notes: formData.get('notes'),
    waybillCode,
    status: 'waiting',
    storageId: formData.get('storage'),
    billingPlanId: billingId,
    createdAt: Date.now(),
    notifiedAt: null,
    pickedAt: null,
    doorRequestedAt: null,
    waybillPhoto,
    packagePhoto,
    pickupPhoto: null,
    payment,
  });

  form.reset();
  renderStorageOptions();
  renderBillingOptions();
  refreshDeliveries();
  showToast('Đã tạo phiếu giao hàng mới.');
});

if (walletTopupForm) {
  walletTopupForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const amount = Number(walletTopupAmountInput.value);
    if (topUpWallet(amount, 'Nạp qua bảng điều hành')) {
      showToast(`Đã nạp ${formatCurrency(amount)} vào ví OnPay.`);
      walletTopupAmountInput.value = '';
      renderMobileApps();
    } else {
      showToast('Vui lòng nhập số tiền nạp hợp lệ.');
    }
  });
}

if (pickupTopupButton) {
  pickupTopupButton.addEventListener('click', () => {
    const amount = Number(pickupTopupAmount.value);
    if (topUpWallet(amount, 'Nạp khi nhận hàng')) {
      showToast(`Nạp ${formatCurrency(amount)} vào ví OnPay.`);
      pickupTopupAmount.value = '';
      if (pickupWalletBalance) {
        pickupWalletBalance.textContent = formatCurrency(onPayWallet.balance);
      }
      renderMobileApps();
    } else {
      showToast('Số tiền nạp chưa hợp lệ.');
    }
  });
}

if (pickupPhotoInput && pickupPreview && pickupPreviewImg) {
  pickupPhotoInput.addEventListener('change', () => {
    if (pickupPreviewUrl) {
      URL.revokeObjectURL(pickupPreviewUrl);
      pickupPreviewUrl = null;
    }
    const [file] = pickupPhotoInput.files || [];
    if (file) {
      pickupPreviewUrl = URL.createObjectURL(file);
      pickupPreviewImg.src = pickupPreviewUrl;
      pickupPreview.hidden = false;
    } else {
      pickupPreviewImg.src = '';
      pickupPreview.hidden = true;
    }
  });
}

if (pickupForm) {
  pickupForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!activePickupId) {
      closePickupModal();
      return;
    }
    const delivery = deliveries.find((item) => item.id === activePickupId);
    if (!delivery) {
      closePickupModal();
      return;
    }

    const payment = ensurePaymentRecord(delivery);
    const dueAmount = payment && payment.status === 'pending' ? payment.amount : 0;

    const file = pickupPhotoInput && pickupPhotoInput.files ? pickupPhotoInput.files[0] : null;
    if (!file) {
      showToast('Vui lòng bổ sung ảnh xác nhận nhận hàng.');
      return;
    }

    let pickupPhoto;
    try {
      pickupPhoto = await readFileAsDataURL(file);
    } catch (error) {
      showToast('Không thể đọc ảnh xác nhận.');
      return;
    }

    let transactionId = payment ? payment.transactionId : null;

    if (dueAmount > 0) {
      const charge = chargeWallet(dueAmount, `Thanh toán phí cho ${delivery.recipient}`);
      if (!charge.success) {
        showToast('Ví OnPay không đủ số dư. Vui lòng nạp thêm.');
        return;
      }
      transactionId = charge.transactionId;
    }

    updateStatus(delivery.id, 'picked', {
      pickupPhoto,
      payment:
        dueAmount > 0 || payment.status === 'pending'
          ? { status: 'paid', transactionId, paidAt: Date.now() }
          : { transactionId },
    });

    closePickupModal();
  });
}

modalCloseButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const modal = button.closest('.modal');
    if (!modal) return;
    if (modal === pickupModal) {
      closePickupModal();
    } else {
      closeModal(modal);
    }
  });
});

[mediaModal, pickupModal].forEach((modal) => {
  if (!modal) return;
  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      if (modal === pickupModal) {
        closePickupModal();
      } else {
        closeModal(modal);
      }
    }
  });
});

statusFilter.addEventListener('change', () => {
  renderTable();
});

sortOrder.addEventListener('change', () => {
  renderTable();
});

storageForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(storageForm);
  const storage = {
    id: crypto.randomUUID(),
    name: formData.get('name'),
    type: formData.get('type'),
    capacity: Number(formData.get('capacity')) || 0,
    doors: Number(formData.get('doors')) || 0,
  };
  storageLocations.push(storage);
  storageForm.reset();
  renderStorageOptions();
  renderStorageList();
  renderStaffStorage();
  if (storageSelect) {
    storageSelect.value = storage.id;
  }
  showToast(`Đã thêm ${formatStorageLabel(storage)}.`);
});

feeForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(feeForm);
  const plan = {
    id: crypto.randomUUID(),
    name: formData.get('name'),
    type: formData.get('type'),
    price: Number(formData.get('price')) || 0,
  };
  feePlans.push(plan);
  feeForm.reset();
  renderBillingOptions();
  renderFeePlans();
  if (billingPlanSelect) {
    billingPlanSelect.value = plan.id;
  }
  showToast(`Đã tạo gói ${plan.name}.`);
});

renderStorageOptions();
renderBillingOptions();
renderFeePlans();
refreshDeliveries();

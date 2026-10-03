(function () {
  var STORAGE_CHECK = 'uaeexitkit-check-v1';
  var STORAGE_GRACE = 'uaeexitkit-grace-v1';
  var ITEMS = [
    { id: 'notice', phase: 'Employer notice & settlement', label: 'Resignation / end-of-contract notice given per your contract and MOHRE rules' },
    { id: 'settlement', phase: 'Employer notice & settlement', label: 'Final settlement & gratuity tracked (employer must pay end-of-service dues within 14 days per Federal Decree-Law No. 33 of 2021 \u2014 confirm current text)' },
    { id: 'experience', phase: 'Employer notice & settlement', label: 'Experience / relieving letter requested from employer' },
    { id: 'dep-visas', phase: 'Residence visas', label: 'Cancel all dependent visas BEFORE sponsor residence cancel' },
    { id: 'res-cancel', phase: 'Residence visas', label: 'Residence visa cancel started (employer via MOHRE then GDRFA/ICP; self-sponsored self-initiates)' },
    { id: 'cancel-paper', phase: 'Residence visas', label: 'Cancellation paper saved; grace days and leave-by date written down from the document' },
    { id: 'traffic', phase: 'Traffic / vehicle', label: 'Traffic fines cleared (RTA / police portals for your emirate)' },
    { id: 'salik', phase: 'Traffic / vehicle', label: 'Salik / toll account settled or closed' },
    { id: 'vehicle', phase: 'Traffic / vehicle', label: 'Vehicle sold / exported / registration transferred; mulkiya & insurance handled' },
    { id: 'dewa-final', phase: 'Housing utilities', label: 'DEWA (or other utility) move-out / disconnect booked; final bill paid' },
    { id: 'dewa-deposit', phase: 'Housing utilities', label: 'DEWA deposit refund path noted (keep one bank open until it lands)' },
    { id: 'ejari', phase: 'Housing utilities', label: 'Ejari cancelled after DEWA final bill (Dubai Land Department / landlord process)' },
    { id: 'telecom', phase: 'Telecom', label: 'Mobile / home internet cancelled (e& / du / Virgin); equipment returned; final bill paid' },
    { id: 'bank-keep', phase: 'Banks', label: 'Keep at least one UAE bank account open until settlement + utility refunds land' },
    { id: 'bank-close', phase: 'Banks', label: 'Close remaining accounts; request account-closure / clearance letter from the bank' },
    { id: 'eid-copy', phase: 'Documents & extras', label: 'Emirates ID copy saved; card returned / cancelled as required on exit' },
    { id: 'insurance', phase: 'Documents & extras', label: 'Health insurance ended or ported; last medical claims filed' },
    { id: 'pobox', phase: 'Documents & extras', label: 'PO Box closed or mail forwarding arranged' },
    { id: 'rta-letter', phase: 'Documents & extras', label: 'RTA / driving experience letter requested if needed for home licence' },
    { id: 'cash-declare', phase: 'Documents & extras', label: 'Cash / valuables declaration rules noted for airport (confirm current UAE & destination limits)' }
  ];

  function loadJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (e) { return fallback; }
  }
  function saveJSON(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }

  function renderChecklist() {
    var state = loadJSON(STORAGE_CHECK, {});
    var box = document.getElementById('check-list');
    box.innerHTML = '';
    var lastPhase = null;
    ITEMS.forEach(function (item) {
      if (item.phase !== lastPhase) {
        var ph = document.createElement('div');
        ph.className = 'phase';
        ph.textContent = item.phase;
        box.appendChild(ph);
        lastPhase = item.phase;
      }
      var row = document.createElement('label');
      row.className = 'check-row';
      var cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = !!state[item.id];
      cb.addEventListener('change', function () {
        state[item.id] = cb.checked;
        saveJSON(STORAGE_CHECK, state);
        updateStatus(state);
      });
      var span = document.createElement('span');
      span.textContent = item.label;
      row.appendChild(cb);
      row.appendChild(span);
      box.appendChild(row);
    });
    updateStatus(state);
  }

  function updateStatus(state) {
    var done = ITEMS.filter(function (i) { return state[i.id]; }).length;
    document.getElementById('check-status').textContent =
      done + ' of ' + ITEMS.length + ' items ready on this device.';
  }

  function addDays(date, days) {
    var d = new Date(date.getTime());
    d.setDate(d.getDate() + days);
    return d;
  }

  function formatDate(d) {
    if (!d || isNaN(d.getTime())) return '\u2014';
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }

  function calcGrace() {
    var input = document.getElementById('cancel-date');
    var daysEl = document.getElementById('grace-days');
    var notes = document.getElementById('grace-notes');
    var out = document.getElementById('grace-result');
    var fine = document.getElementById('fine-result');
    if (!input.value) {
      out.textContent = 'Enter a cancellation date first.';
      fine.textContent = '';
      return;
    }
    var cancel = new Date(input.value + 'T00:00:00');
    if (isNaN(cancel.getTime())) {
      out.textContent = 'Invalid date.';
      fine.textContent = '';
      return;
    }
    var days = parseInt(daysEl.value, 10);
    if (isNaN(days) || days < 0) {
      out.textContent = 'Enter a valid grace-days number.';
      fine.textContent = '';
      return;
    }
    var leaveBy = addDays(cancel, days);
    out.textContent = formatDate(leaveBy) +
      ' (cancel ' + formatDate(cancel) + ' + ' + days + ' grace days). Confirm on your cancellation document before you travel.';
    fine.textContent =
      'Overstay fine reminder (commonly reported ~AED 50/day after grace \u2014 confirm on your document and official channels; this site does not calculate a fine total).';
    saveJSON(STORAGE_GRACE, {
      cancel: input.value,
      days: days,
      notes: notes.value || '',
      leaveBy: formatDate(leaveBy)
    });
  }

  function loadGrace() {
    var g = loadJSON(STORAGE_GRACE, {});
    if (g.cancel) document.getElementById('cancel-date').value = g.cancel;
    if (typeof g.days === 'number') document.getElementById('grace-days').value = g.days;
    if (g.notes) document.getElementById('grace-notes').value = g.notes;
    if (g.leaveBy) {
      document.getElementById('grace-result').textContent =
        g.leaveBy + ' (saved on this device). Confirm on your cancellation document before you travel.';
      document.getElementById('fine-result').textContent =
        'Overstay fine reminder (commonly reported ~AED 50/day after grace \u2014 confirm on your document and official channels).';
    }
  }

  function exportSummary() {
    var state = loadJSON(STORAGE_CHECK, {});
    var g = loadJSON(STORAGE_GRACE, {});
    var lines = [
      'UAE Exit Kit summary (not immigration or legal advice)',
      'Generated locally \u2014 ' + new Date().toISOString().slice(0, 10),
      '',
      'Checklist:'
    ];
    var lastPhase = null;
    ITEMS.forEach(function (i) {
      if (i.phase !== lastPhase) {
        lines.push('');
        lines.push('## ' + i.phase);
        lastPhase = i.phase;
      }
      lines.push((state[i.id] ? '[x] ' : '[ ] ') + i.label);
    });
    lines.push('');
    lines.push('Grace helper:');
    lines.push('Cancellation date: ' + (g.cancel || '\u2014'));
    lines.push('Grace days: ' + (typeof g.days === 'number' ? g.days : '\u2014'));
    lines.push('Leave-by reminder: ' + (g.leaveBy || '\u2014'));
    lines.push('Notes: ' + (g.notes || '\u2014'));
    lines.push('');
    lines.push('Verify on official portals (GDRFA / ICP / MOHRE / DEWA / Dubai Land) and on your cancellation paper.');
    var text = lines.join('\n');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        document.getElementById('check-status').textContent = 'Summary copied to clipboard.';
      }).catch(function () {
        window.prompt('Copy this summary:', text);
      });
    } else {
      window.prompt('Copy this summary:', text);
    }
  }

  document.getElementById('btn-export').addEventListener('click', exportSummary);
  document.getElementById('btn-print').addEventListener('click', function () { window.print(); });
  document.getElementById('btn-reset-check').addEventListener('click', function () {
    saveJSON(STORAGE_CHECK, {});
    renderChecklist();
  });
  document.getElementById('btn-calc-grace').addEventListener('click', calcGrace);
  document.getElementById('btn-clear-grace').addEventListener('click', function () {
    saveJSON(STORAGE_GRACE, {});
    document.getElementById('cancel-date').value = '';
    document.getElementById('grace-days').value = '30';
    document.getElementById('grace-notes').value = '';
    document.getElementById('grace-result').textContent = '\u2014';
    document.getElementById('fine-result').textContent = '';
  });

  renderChecklist();
  loadGrace();
})();

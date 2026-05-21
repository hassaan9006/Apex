/* =============================================================
   APEX FITNESS — BOOKING PAGE LOGIC
   Handles: Plan selection, multi-step form, validation,
            payment flow, receipt generation & save-to-gallery.
   ============================================================= */

(function () {
    'use strict';

    // ---- State ----
    let selectedPlan = null;   // 'day' or 'monthly'
    let selectedPrice = 0;
    let paymentMethod = null;  // 'online' or 'cash'
    let currentStep = 1;

    // ---- DOM Refs ----
    const planCards = document.querySelectorAll('.plan-card');
    const formSection = document.getElementById('booking-form');
    const formPlanLabel = document.getElementById('form-plan-label');
    const monthlyFields = document.getElementById('monthly-fields');
    const onlineFields = document.getElementById('online-fields');
    const payOptions = document.querySelectorAll('.payment-option');
    const steps = document.querySelectorAll('.form-step');
    const indicators = document.querySelectorAll('.step-indicator');
    const orderSummary = document.getElementById('order-summary');
    const receiptModal = document.getElementById('receipt-modal');
    const receiptBody = document.getElementById('receipt-body');
    const receiptIdText = document.getElementById('receipt-id-text');

    // =========================================================
    // 1. PLAN SELECTION
    // =========================================================
    planCards.forEach(card => {
        card.addEventListener('click', () => selectPlan(card));
        card.querySelector('.plan-select-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            selectPlan(card);
        });
    });

    function selectPlan(card) {
        // Deselect all, then select clicked
        planCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');

        selectedPlan = card.dataset.plan;
        selectedPrice = parseInt(card.dataset.price);

        // Update form label
        const label = selectedPlan === 'day' ? '1-Day Pass' : 'Monthly Membership';
        formPlanLabel.textContent = label + ' — Rs. ' + selectedPrice.toLocaleString();

        // Show/hide monthly-only fields
        monthlyFields.style.display = selectedPlan === 'monthly' ? 'block' : 'none';

        // Reset form to step 1
        currentStep = 1;
        updateSteps();

        // Show form section with smooth scroll
        formSection.classList.add('visible');
        setTimeout(() => {
            formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }


    // =========================================================
    // 2. MULTI-STEP FORM NAVIGATION
    // =========================================================
    document.getElementById('btn-to-step2').addEventListener('click', () => {
        if (validateStep1()) goToStep(2);
    });

    document.getElementById('btn-to-step3').addEventListener('click', () => {
        if (validateStep2()) { buildSummary(); goToStep(3); }
    });

    document.getElementById('btn-back-step1').addEventListener('click', () => goToStep(1));
    document.getElementById('btn-back-step2').addEventListener('click', () => goToStep(2));

    function goToStep(step) {
        currentStep = step;
        updateSteps();
    }

    function updateSteps() {
        steps.forEach(s => s.classList.remove('active'));
        document.getElementById('step-' + currentStep).classList.add('active');

        indicators.forEach(ind => {
            const s = parseInt(ind.dataset.step);
            ind.classList.remove('active', 'completed');
            if (s === currentStep) ind.classList.add('active');
            else if (s < currentStep) ind.classList.add('completed');
        });
    }


    // =========================================================
    // 3. PAYMENT METHOD SELECTION
    // =========================================================
    payOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            payOptions.forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            opt.querySelector('input[type="radio"]').checked = true;
            paymentMethod = opt.querySelector('input').value;

            // Show card fields only for online
            onlineFields.style.display = paymentMethod === 'online' ? 'block' : 'none';
        });
    });


    // =========================================================
    // 4. VALIDATION
    // =========================================================
    function setError(id) {
        const el = document.getElementById(id);
        el.classList.add('error');
        el.parentElement.classList.add('has-error');
    }

    function clearErrors() {
        document.querySelectorAll('.form-input.error, .form-select.error')
            .forEach(el => { el.classList.remove('error'); el.parentElement.classList.remove('has-error'); });
    }

    function val(id) { return document.getElementById(id).value.trim(); }

    function validateStep1() {
        clearErrors();
        let valid = true;

        if (!val('first-name')) { setError('first-name'); valid = false; }
        if (!val('last-name')) { setError('last-name'); valid = false; }
        if (!val('email') || !/\S+@\S+\.\S+/.test(val('email'))) { setError('email'); valid = false; }
        if (!val('phone') || val('phone').length < 7) { setError('phone'); valid = false; }

        if (selectedPlan === 'monthly') {
            if (!val('address')) { setError('address'); valid = false; }
            if (!val('city')) { setError('city'); valid = false; }
            if (!val('cnic')) { setError('cnic'); valid = false; }
            if (!val('emergency-contact')) { setError('emergency-contact'); valid = false; }
        }

        return valid;
    }

    function validateStep2() {
        clearErrors();
        if (!paymentMethod) {
            alert('Please select a payment method.');
            return false;
        }
        if (paymentMethod === 'online') {
            let valid = true;
            if (!val('card-name')) { setError('card-name'); valid = false; }
            if (!val('card-number') || val('card-number').replace(/\s/g, '').length < 16) { setError('card-number'); valid = false; }
            if (!val('card-expiry')) { setError('card-expiry'); valid = false; }
            if (!val('card-cvv') || val('card-cvv').length < 3) { setError('card-cvv'); valid = false; }
            return valid;
        }
        return true;
    }

    // Auto-format card number with spaces
    const cardNumInput = document.getElementById('card-number');
    cardNumInput.addEventListener('input', () => {
        let v = cardNumInput.value.replace(/\D/g, '').substring(0, 16);
        cardNumInput.value = v.replace(/(.{4})/g, '$1 ').trim();
    });

    // Auto-format expiry
    const cardExpInput = document.getElementById('card-expiry');
    cardExpInput.addEventListener('input', () => {
        let v = cardExpInput.value.replace(/\D/g, '').substring(0, 4);
        if (v.length >= 3) v = v.substring(0, 2) + '/' + v.substring(2);
        cardExpInput.value = v;
    });


    // =========================================================
    // 5. ORDER SUMMARY (Step 3)
    // =========================================================
    function buildSummary() {
        const planLabel = selectedPlan === 'day' ? '1-Day Pass' : 'Monthly Membership';
        const payLabel = paymentMethod === 'online' ? 'Online (Card)' : 'Cash at Gym';

        let rows = `
            <div class="summary-row">
                <span class="summary-label">Plan</span>
                <span class="summary-value">${planLabel}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Name</span>
                <span class="summary-value">${val('first-name')} ${val('last-name')}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Email</span>
                <span class="summary-value">${val('email')}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Phone</span>
                <span class="summary-value">${val('phone')}</span>
            </div>`;

        if (selectedPlan === 'monthly') {
            rows += `
            <div class="summary-row">
                <span class="summary-label">Address</span>
                <span class="summary-value">${val('address')}, ${val('city')}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">CNIC</span>
                <span class="summary-value">${val('cnic')}</span>
            </div>`;
        }

        rows += `
            <div class="summary-row">
                <span class="summary-label">Payment</span>
                <span class="summary-value">${payLabel}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Total Amount</span>
                <span class="summary-value">Rs. ${selectedPrice.toLocaleString()}</span>
            </div>`;

        orderSummary.innerHTML = rows;
    }


    // =========================================================
    // 6. CONFIRM BOOKING
    // =========================================================
    document.getElementById('btn-confirm').addEventListener('click', () => {
        const bookingId = 'APX-' + Date.now().toString(36).toUpperCase();

        if (paymentMethod === 'cash') {
            showCashReceipt(bookingId);
        } else {
            showOnlineSuccess(bookingId);
        }
    });


    // =========================================================
    // 7. CASH RECEIPT MODAL
    // =========================================================
    function showCashReceipt(bookingId) {
        const planLabel = selectedPlan === 'day' ? '1-Day Pass' : 'Monthly Membership';
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
        const timeStr = now.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' });

        receiptIdText.textContent = 'Booking #' + bookingId;

        let html = `
            <div class="summary-row">
                <span class="summary-label">Date</span>
                <span class="summary-value">${dateStr} — ${timeStr}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Plan</span>
                <span class="summary-value">${planLabel}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Customer</span>
                <span class="summary-value">${val('first-name')} ${val('last-name')}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Phone</span>
                <span class="summary-value">${val('phone')}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Payment</span>
                <span class="summary-value">Cash (Pending)</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Total Due</span>
                <span class="summary-value">Rs. ${selectedPrice.toLocaleString()}</span>
            </div>`;

        receiptBody.innerHTML = html;
        receiptModal.classList.add('visible');
        document.body.style.overflow = 'hidden';
    }


    // =========================================================
    // 8. ONLINE PAYMENT SUCCESS (in-form)
    // =========================================================
    function showOnlineSuccess(bookingId) {
        const step3 = document.getElementById('step-3');
        step3.innerHTML = `
            <div class="online-success">
                <span class="success-icon">✅</span>
                <h3 class="success-title">BOOKING CONFIRMED</h3>
                <p class="success-message">
                    Your payment was successful! Booking ID: <strong>${bookingId}</strong>.
                    A confirmation has been sent to <strong>${val('email')}</strong>.
                    See you at the gym! 
                </p>
            </div>
            <div class="form-nav" style="justify-content:center;margin-top:25px;">
                <a href="../index.html" class="btn-form btn-next" style="text-decoration:none;text-align:center;">Back to Home</a>
            </div>`;

        // Mark all steps completed
        indicators.forEach(ind => {
            ind.classList.remove('active');
            ind.classList.add('completed');
        });
    }


    // =========================================================
    // 9. SAVE RECEIPT AS IMAGE (to gallery / download)
    // =========================================================
    document.getElementById('btn-save-receipt').addEventListener('click', () => {
        const card = document.getElementById('receipt-card');
        // Use html2canvas if available, otherwise fallback to manual canvas
        saveReceiptAsImage(card);
    });

    function saveReceiptAsImage(element) {
        // Build a canvas manually from receipt data
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const W = 600, H = 900;
        canvas.width = W;
        canvas.height = H;

        // Background
        ctx.fillStyle = '#1A1A1A';
        ctx.fillRect(0, 0, W, H);

        // Red header
        const grad = ctx.createLinearGradient(0, 0, W, 120);
        grad.addColorStop(0, '#E63946');
        grad.addColorStop(1, '#ff4757');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, 120);

        // Logo text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 36px "Bebas Neue", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('APEX.', W / 2, 55);
        ctx.font = '12px "Poppins", sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.fillText('FITNESS & WELLNESS', W / 2, 80);

        // Status
        ctx.font = '40px serif';
        ctx.fillText('🧾', W / 2, 170);
        ctx.font = 'bold 16px "Oswald", sans-serif';
        ctx.fillStyle = '#4ecdc4';
        ctx.fillText('CASH PAYMENT — PENDING', W / 2, 200);

        // Dashed line
        ctx.setLineDash([6, 6]);
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.beginPath();
        ctx.moveTo(40, 225);
        ctx.lineTo(W - 40, 225);
        ctx.stroke();
        ctx.setLineDash([]);

        // Receipt details
        const planLabel = selectedPlan === 'day' ? '1-Day Pass' : 'Monthly Membership';
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });

        const details = [
            ['Date', dateStr],
            ['Plan', planLabel],
            ['Customer', val('first-name') + ' ' + val('last-name')],
            ['Phone', val('phone')],
            ['Payment', 'Cash (Pending)'],
            ['Total Due', 'Rs. ' + selectedPrice.toLocaleString()]
        ];

        let y = 265;
        details.forEach(([label, value]) => {
            ctx.textAlign = 'left';
            ctx.font = '13px "Poppins", sans-serif';
            ctx.fillStyle = '#B0B0B0';
            ctx.fillText(label, 50, y);

            ctx.textAlign = 'right';
            ctx.font = 'bold 14px "Oswald", sans-serif';
            ctx.fillStyle = '#FFFFFF';
            if (label === 'Total Due') ctx.fillStyle = '#E63946';
            ctx.fillText(value, W - 50, y);

            // separator
            ctx.strokeStyle = 'rgba(255,255,255,0.05)';
            ctx.beginPath();
            ctx.moveTo(50, y + 14);
            ctx.lineTo(W - 50, y + 14);
            ctx.stroke();
            y += 42;
        });

        // Booking ID
        y += 10;
        ctx.textAlign = 'center';
        ctx.font = '13px "Courier New", monospace';
        ctx.fillStyle = '#B0B0B0';
        ctx.fillText(receiptIdText.textContent, W / 2, y);

        // Note
        y += 40;
        ctx.font = '11px "Poppins", sans-serif';
        ctx.fillStyle = '#B0B0B0';
        const noteLines = wrapText(ctx, 'Please show this receipt at the APEX Fitness front desk and pay the amount in cash. Your booking will be confirmed upon payment.', W - 100);
        noteLines.forEach(line => {
            ctx.fillText(line, W / 2, y);
            y += 18;
        });

        // Convert and download
        canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'APEX_Receipt_' + Date.now() + '.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            // Feedback
            const btn = document.getElementById('btn-save-receipt');
            btn.textContent = '✅ Saved!';
            setTimeout(() => { btn.textContent = '📥 Save to Gallery'; }, 2500);
        }, 'image/png');
    }

    // Helper: wrap long text into lines
    function wrapText(ctx, text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let line = '';
        words.forEach(word => {
            const test = line + word + ' ';
            if (ctx.measureText(test).width > maxWidth && line) {
                lines.push(line.trim());
                line = word + ' ';
            } else {
                line = test;
            }
        });
        if (line) lines.push(line.trim());
        return lines;
    }


    // =========================================================
    // 10. CLOSE RECEIPT MODAL
    // =========================================================
    document.getElementById('btn-done').addEventListener('click', () => {
        receiptModal.classList.remove('visible');
        document.body.style.overflow = '';
        // Redirect home
        window.location.href = '../index.html';
    });

    // Close on overlay click
    receiptModal.addEventListener('click', (e) => {
        if (e.target === receiptModal) {
            receiptModal.classList.remove('visible');
            document.body.style.overflow = '';
        }
    });

})();

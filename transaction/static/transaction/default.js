// Global variables
let transactionModal;
let monthlyTrendChart;

// Initialize when the document is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ JavaScript file loaded correctly!");

    // Check if buttons exist
    const addButtons = [
        document.getElementById('addTransactionBtn'),
        document.getElementById('navAddTransactionBtn')
    ];

    console.log("Add Transaction Buttons found:", addButtons);

    addButtons.forEach(button => {
        if (button) {
            button.addEventListener('click', showAddTransactionModal);
            console.log(`✅ Click listener attached to button:`, button.id);
        }
    });

    // Initialize Bootstrap modal
    const modalElement = document.getElementById('transactionModal');
    console.log("Modal element found:", modalElement);
    
    try {
        transactionModal = new bootstrap.Modal(document.getElementById('transactionModal'));
        console.log("✅ Modal initialized");
    } catch (error) {
        console.error("❌ Error initializing modal:", error);
    }
    
    // Initialize Chart.js for monthly trend
    const ctx = document.getElementById('monthlyTrendChart').getContext('2d');
    monthlyTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Income',
                data: [],
                borderColor: '#4CAF50',
                tension: 0.1
            }, {
                label: 'Expenses',
                data: [],
                borderColor: '#f44336',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Event listeners
    const saveButton = document.getElementById('saveTransaction');
    console.log("Save Transaction Button found:", saveButton);
    if (saveButton) {
        saveButton.addEventListener('click', saveTransaction);
        console.log("✅ Click listener attached to Save Transaction button");
    } else {
        console.error("❌ Could not find Save Transaction button");
    }
    
    // Load initial data
    loadDashboardData();
});

// Load dashboard data
async function loadDashboardData() {
    try {
        const response = await fetch('/api/transactions/');
        const transactions = await response.json();
        
        updateSummaryCards(transactions);
        updateTransactionsTable(transactions);
        updateTopCategories(transactions);
        updateMonthlyTrend(transactions);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showError('Failed to load dashboard data');
    }
}

// Update summary cards
function updateSummaryCards(transactions) {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    let totalBalance = 0;
    let monthlyIncome = 0;
    let monthlyExpenses = 0;
    
    transactions.forEach(transaction => {
        const transactionDate = new Date(transaction.date);
        const amount = parseFloat(transaction.amount);
        
        if (transaction.category === 'income') {
            totalBalance += amount;
            if (transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear) {
                monthlyIncome += amount;
            }
        } else {
            totalBalance -= amount;
            if (transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear) {
                monthlyExpenses += amount;
            }
        }
    });
    
    document.getElementById('totalBalance').textContent = formatCurrency(totalBalance);
    document.getElementById('monthlyIncome').textContent = formatCurrency(monthlyIncome);
    document.getElementById('monthlyExpenses').textContent = formatCurrency(monthlyExpenses);
}

// Update transactions table
function updateTransactionsTable(transactions) {
    const tbody = document.getElementById('transactionsList');
    tbody.innerHTML = '';
    
    transactions.forEach(transaction => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(transaction.date)}</td>
            <td>${transaction.description}</td>
            <td><span class="category-badge ${transaction.category}">${transaction.category}</span></td>
            <td class="${transaction.category === 'income' ? 'text-success' : 'text-danger'}">
                ${formatCurrency(transaction.amount)}
            </td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="editTransaction(${transaction.id})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteTransaction(${transaction.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Update top categories
function updateTopCategories(transactions) {
    const categories = {};
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    transactions.forEach(transaction => {
        const transactionDate = new Date(transaction.date);
        if (transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear) {
            if (transaction.category !== 'income') {
                categories[transaction.category] = (categories[transaction.category] || 0) + parseFloat(transaction.amount);
            }
        }
    });
    
    const topCategoriesDiv = document.getElementById('topCategories');
    topCategoriesDiv.innerHTML = '';
    
    Object.entries(categories)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .forEach(([category, amount]) => {
            const categoryElement = document.createElement('div');
            categoryElement.className = 'd-flex justify-content-between align-items-center mb-2';
            categoryElement.innerHTML = `
                <span class="category-badge ${category}">${category}</span>
                <span class="text-danger">${formatCurrency(amount)}</span>
            `;
            topCategoriesDiv.appendChild(categoryElement);
        });
}

// Update monthly trend chart
function updateMonthlyTrend(transactions) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    
    const monthlyData = {
        income: new Array(12).fill(0),
        expenses: new Array(12).fill(0)
    };
    
    transactions.forEach(transaction => {
        const date = new Date(transaction.date);
        if (date.getFullYear() === currentYear) {
            const amount = parseFloat(transaction.amount);
            if (transaction.category === 'income') {
                monthlyData.income[date.getMonth()] += amount;
            } else {
                monthlyData.expenses[date.getMonth()] += amount;
            }
        }
    });
    
    monthlyTrendChart.data.labels = months;
    monthlyTrendChart.data.datasets[0].data = monthlyData.income;
    monthlyTrendChart.data.datasets[1].data = monthlyData.expenses;
    monthlyTrendChart.update();
}

// Show add transaction modal
function showAddTransactionModal() {
    console.log("Transaction button clicked");
    document.getElementById('transactionForm').reset();
    document.getElementById('date').valueAsDate = new Date();
    
    // Add event listener to save button when modal is shown
    const saveButton = document.getElementById('saveTransaction');
    if (saveButton) {
        saveButton.removeEventListener('click', saveTransaction); // Remove any existing listeners
        saveButton.addEventListener('click', saveTransaction);
        console.log("✅ Save button listener attached when modal opened");
    }
    
    transactionModal.show();
}

// Save transaction
async function saveTransaction(event) {
    // Prevent any default form submission
    if (event) {
        event.preventDefault();
    }
    
    console.log("Save Transaction button clicked");
    
    const form = document.getElementById('transactionForm');
    console.log("Form found:", form);
    
    if (!form.checkValidity()) {
        console.log("Form validation failed");
        form.reportValidity();
        return;
    }
    
    const transactionData = {
        description: document.getElementById('description').value,
        amount: parseFloat(document.getElementById('amount').value), // Ensure amount is a number
        category: document.getElementById('category').value,
        date: document.getElementById('date').value
    };
    
    console.log("Transaction data being sent:", transactionData);
    
    try {
        const response = await fetch('/api/transactions/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'),
                'Accept': 'application/json'
            },
            credentials: 'same-origin',
            body: JSON.stringify(transactionData)
        });
        
        console.log("Response status:", response.status);
        
        if (response.ok) {
            transactionModal.hide();
            loadDashboardData();
            showSuccess('Transaction added successfully');
        } else {
            const errorData = await response.json();
            console.error('Server error details:', errorData);
            throw new Error(errorData.detail || 'Failed to add transaction');
        }
    } catch (error) {
        console.error('Error saving transaction:', error);
        showError(error.message || 'Failed to save transaction');
    }
}

// Edit transaction
async function editTransaction(id) {
    try {
        const response = await fetch(`/api/transactions/${id}/`);
        const transaction = await response.json();
        
        document.getElementById('description').value = transaction.description;
        document.getElementById('amount').value = transaction.amount;
        document.getElementById('category').value = transaction.category;
        document.getElementById('date').value = transaction.date;
        
        transactionModal.show();
        // Store the transaction ID for updating
        document.getElementById('saveTransaction').dataset.transactionId = id;
    } catch (error) {
        console.error('Error loading transaction:', error);
        showError('Failed to load transaction');
    }
}

// Delete transaction
async function deleteTransaction(id) {
    if (!confirm('Are you sure you want to delete this transaction?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/transactions/${id}/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        });
        
        if (response.ok) {
            loadDashboardData();
            showSuccess('Transaction deleted successfully');
        } else {
            throw new Error('Failed to delete transaction');
        }
    } catch (error) {
        console.error('Error deleting transaction:', error);
        showError('Failed to delete transaction');
    }
}

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function showSuccess(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-success alert-dismissible fade show';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.querySelector('.container').insertBefore(alert, document.querySelector('.row'));
    setTimeout(() => alert.remove(), 5000);
}

function showError(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-danger alert-dismissible fade show';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.querySelector('.container').insertBefore(alert, document.querySelector('.row'));
    setTimeout(() => alert.remove(), 5000);
}

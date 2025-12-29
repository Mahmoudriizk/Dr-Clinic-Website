/**
 * main.js - الملف الرئيسي لموقع عيادة الدكتور
 * نظام القائمة، النماذج، الإشعارات وإرسال الواتساب
 */

// ==================== المتغيرات العامة ====================
const SITE_NAME = "عيادة د. بسام طه";

// ==================== دالة تهيئة القائمة المتنقلة ====================
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (!menuToggle || !mainNav) return;
    
    // إضافة أيقونة القائمة
    if (!menuToggle.querySelector('i')) {
        menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    }
    
    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        mainNav.classList.toggle('active');
        
        const icon = menuToggle.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        }
        
        menuToggle.setAttribute('aria-label', 
            mainNav.classList.contains('active') ? 'إغلاق القائمة' : 'فتح القائمة'
        );
    });
    
    // إغلاق القائمة عند النقر على رابط
    mainNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mainNav.classList.remove('active');
            const icon = menuToggle.querySelector('i');
            if (icon) {
                icon.classList.replace('fa-times', 'fa-bars');
            }
            menuToggle.setAttribute('aria-label', 'فتح القائمة');
        });
    });
    
    // إغلاق القائمة عند النقر خارجها
    document.addEventListener('click', (e) => {
        if (!mainNav.contains(e.target) && !menuToggle.contains(e.target)) {
            mainNav.classList.remove('active');
            const icon = menuToggle.querySelector('i');
            if (icon) {
                icon.classList.replace('fa-times', 'fa-bars');
            }
            menuToggle.setAttribute('aria-label', 'فتح القائمة');
        }
    });
}

// ==================== دالة إظهار الإشعارات ====================
function showNotification(message, type = 'info', duration = 5000) {
    // إزالة الإشعارات القديمة
    document.querySelectorAll('.notification').forEach(notification => {
        notification.remove();
    });
    
    // إنشاء الإشعار
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // أيقونة حسب النوع
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" aria-label="إغلاق">
            &times;
        </button>
    `;
    
    // إضافة للصفحة
    document.body.appendChild(notification);
    
    // إظهاره بتحريك
    setTimeout(() => notification.classList.add('show'), 100);
    
    // إغلاق عند النقر على الزر
    notification.querySelector('.notification-close').addEventListener('click', () => {
        closeNotification(notification);
    });
    
    // إغلاق تلقائي
    if (duration > 0) {
        setTimeout(() => {
            if (notification.parentNode) {
                closeNotification(notification);
            }
        }, duration);
    }
    
    return notification;
}

// دالة مساعدة لإغلاق الإشعار
function closeNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 300);
}

// ==================== نظام إرسال الفورم للواتساب ====================
function sendToWhatsApp(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // التحقق من البيانات
    if (!validateWhatsAppForm(data)) {
        return false;
    }
    
    // تنسيق الرسالة
    const message = formatWhatsAppMessage(data);
    
    // رقم الواتساب الهدف
    const phoneNumber = '201010106683';
    
    // إنشاء رابط الواتساب
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    // فتح الواتساب
    window.open(whatsappUrl, '_blank');
    
    // إظهار رسالة تأكيد
    showNotification('✅ تم فتح الواتساب، يرجى إرسال الرسالة', 'success');
    
    // إعادة تعيين الفورم
    form.reset();
    
    return false;
}

// ==================== التحقق من نموذج الواتساب ====================
function validateWhatsAppForm(data) {
    let isValid = true;
    const errors = [];
    
    if (!data.name || data.name.trim().length < 2) {
        errors.push('الاسم مطلوب (على الأقل حرفين)');
        isValid = false;
    }
    
    if (!data.phone || !/^[0-9]{10,15}$/.test(data.phone.replace(/\D/g, ''))) {
        errors.push('رقم الهاتف غير صالح (10-15 رقم)');
        isValid = false;
    }
    
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.push('البريد الإلكتروني غير صالح');
        isValid = false;
    }
    
    // إظهار الأخطاء إذا وجدت
    if (errors.length > 0) {
        showNotification(errors[0], 'error');
    }
    
    return isValid;
}

// ==================== تنسيق رسالة الواتساب ====================
function formatWhatsAppMessage(data) {
    return `📋 *طلب جديد من موقع العيادة*

👤 *الاسم:* ${data.name}
📞 *الهاتف:* ${data.phone}
📧 *البريد:* ${data.email || 'غير محدد'}
🎯 *الخدمة:* ${getServiceName(data.service) || 'غير محدد'}
📝 *الرسالة:* ${data.message || 'لا توجد رسالة'}

⏰ *التاريخ:* ${new Date().toLocaleString('ar-EG')}
🌐 *المصدر:* موقع عيادة د. بسام طه

_هذه رسالة تلقائية من موقع العيادة_`;
}

// ==================== تحويل اسم الخدمة ====================
function getServiceName(serviceKey) {
    const services = {
        'consultation': 'استشارة طبية',
        'appointment': 'حجز موعد',
        'followup': 'متابعة حالة',
        'emergency': 'حالة طارئة',
        'inquiry': 'استفسار عام'
    };
    
    return services[serviceKey] || serviceKey;
}

// ==================== تهيئة النماذج للواتساب ====================
function initWhatsAppForms() {
    const forms = document.querySelectorAll('form[id="contactForm"], form.whatsapp-form');
    
    forms.forEach(form => {
        // تغيير زر الإرسال
        const submitBtn = form.querySelector('.btn-submit');
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fab fa-whatsapp"></i> إرسال عبر الواتساب';
            
            // إضافة تنسيقات الواتساب
            submitBtn.classList.add('btn-whatsapp');
        }
        
        // إضافة حدث الإرسال
        form.addEventListener('submit', sendToWhatsApp);
        
        // إضافة تحقق أثناء الكتابة
        form.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('input', () => {
                input.classList.remove('error');
                
                // التحقق الفوري للبريد الإلكتروني
                if (input.type === 'email' && input.value) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(input.value)) {
                        input.classList.add('error');
                    }
                }
                
                // التحقق الفوري للهاتف
                if (input.type === 'tel' && input.value) {
                    const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
                    if (!phoneRegex.test(input.value.replace(/\s/g, ''))) {
                        input.classList.add('error');
                    }
                }
            });
        });
    });
}

// ==================== دالة تهيئة الأسئلة الشائعة ====================
function initFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;
            const isOpen = answer.classList.contains('open');
            
            // إغلاق جميع الإجابات الأخرى
            document.querySelectorAll('.faq-answer').forEach(ans => {
                ans.classList.remove('open');
                ans.previousElementSibling.classList.remove('active');
            });
            
            // فتح/إغلاق السؤال الحالي
            if (!isOpen) {
                answer.classList.add('open');
                question.classList.add('active');
            }
        });
    });
}

// ==================== دالة تحديث السنة ====================
function updateCurrentYear() {
    const yearElements = document.querySelectorAll('#current-year, [data-current-year]');
    const currentYear = new Date().getFullYear();
    
    yearElements.forEach(element => {
        element.textContent = currentYear;
    });
}

// ==================== دالة تهيئة الموقع ====================
function initializeApp() {
    console.log('🚀 بدء تهيئة موقع العيادة...');
    
    try {
        // 1. إخفاء زر اللغة إذا كان موجود
        const langToggle = document.getElementById('langToggle');
        if (langToggle) {
            langToggle.style.display = 'none';
        }
        
        // 2. إزالة أي data-key من المحتوى
        document.querySelectorAll('[data-key]').forEach(element => {
            const key = element.getAttribute('data-key');
            // نستخدم النص الحالي بدون ترجمة
            element.removeAttribute('data-key');
        });
        
        // 3. تهيئة المكونات
        initMobileMenu();
        initWhatsAppForms();
        initFAQ();
        updateCurrentYear();
        
        // 4. إضافة أنماط مخصصة
        addCustomStyles();
        
        console.log('✅ تم تهيئة الموقع بنجاح!');
        
        // إظهار رسالة ترحيب
        setTimeout(() => {
            showNotification('مرحباً بك في عيادة الدكتور بسام طه', 'info', 3000);
        }, 1000);
        
    } catch (error) {
        console.error('❌ خطأ في تهيئة التطبيق:', error);
        showNotification('حدث خطأ في تحميل الموقع', 'error');
    }
}

// ==================== دالة إضافة أنماط مخصصة ====================
function addCustomStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .error {
            border-color: #dc3545 !important;
            background: rgba(220, 53, 69, 0.05) !important;
        }
        
        /* تنسيقات الواتساب */
        .btn-whatsapp {
            background: linear-gradient(135deg, #25D366 0%, #128C7E 100%) !important;
            border-color: #25D366 !important;
            color: white !important;
        }
        
        .btn-whatsapp:hover {
            background: linear-gradient(135deg, #128C7E 0%, #075E54 100%) !important;
            transform: translateY(-3px);
            box-shadow: 0 10px 20px rgba(37, 211, 102, 0.3);
        }
        
        /* إخفاء زر اللغة */
        .language-switcher {
            display: none !important;
        }
    `;
    
    document.head.appendChild(style);
}

// ==================== بدء التطبيق ====================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
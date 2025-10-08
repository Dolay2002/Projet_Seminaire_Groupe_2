// Application JavaScript pour le site de documentation du système de levage

document.addEventListener('DOMContentLoaded', function() {
    // Initialisation de l'application
    initNavigation();
    initChart();

    console.log('Application initialisée');
});

/**
 * Gestion de la navigation entre les pages
 */
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const navCards = document.querySelectorAll('.nav-card');
    const pages = document.querySelectorAll('.page');

    // Gestion des liens de navigation dans le header
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetPage = this.getAttribute('data-page');
            showPage(targetPage);
            updateActiveNav(this);
        });
    });

    // Gestion des cartes de navigation sur la page d'accueil
    navCards.forEach(card => {
        card.addEventListener('click', function() {
            const targetPage = this.getAttribute('data-page');
            showPage(targetPage);
            updateActiveNavByPage(targetPage);
        });

        // Ajout du focus pour l'accessibilité
        card.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });

    /**
     * Affiche la page demandée et masque les autres
     */
    function showPage(pageId) {
        pages.forEach(page => {
            if (page.id === pageId) {
                page.classList.add('active');
            } else {
                page.classList.remove('active');
            }
        });

        // Scroll vers le haut lors du changement de page
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Réinitialiser le graphique si on navigue vers la page donnée
        if (pageId === 'donnees') {
            setTimeout(initChart, 100);
        }
    }

    /**
     * Met à jour la navigation active
     */
    function updateActiveNav(activeLink) {
        navLinks.forEach(link => {
            link.classList.remove('active');
        });
        activeLink.classList.add('active');
    }

    /**
     * Met à jour la navigation active par nom de page
     */
    function updateActiveNavByPage(pageId) {
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-page') === pageId) {
                link.classList.add('active');
            }
        });
    }
}

/**
 * Initialisation du graphique des performances
 */
function initChart() {
    const canvas = document.getElementById('performanceChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configuration du canvas
    canvas.width = 800;
    canvas.height = 400;

    // Données du graphique
    const data = {
        labels: ['Charge max', 'Force effort', 'Avantage méca.', 'Hauteur levage', 'Temps levage'],
        theoretical: [100, 25, 4.0, 2.0, 30],
        measured: [95, 28, 3.4, 1.8, 35],
        units: ['kg', 'N', '-', 'm', 's']
    };

    // Normalisation des données pour l'affichage (en pourcentages)
    const normalizedTheoretical = [100, 100, 100, 100, 100]; // 100% de référence
    const normalizedMeasured = [95, 112, 85, 90, 117]; // Pourcentages relatifs

    drawChart(ctx, canvas, data, normalizedTheoretical, normalizedMeasured);
}

/**
 * Dessine le graphique
 */
function drawChart(ctx, canvas, data, theoretical, measured) {
    const padding = 60;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - 2 * padding;
    const barWidth = chartWidth / (data.labels.length * 3); // 3 pour l'espacement

    // Couleurs CESI
    const colors = {
        yellow: '#FFCD00',
        blue: '#2E5BFF',
        gray: '#666666',
        lightGray: '#F5F5F5',
        black: '#000000'
    };

    // Effacer le canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Arrière-plan
    ctx.fillStyle = colors.lightGray;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grille horizontale
    ctx.strokeStyle = '#E0E0E0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(canvas.width - padding, y);
        ctx.stroke();

        // Étiquettes de l'axe Y
        ctx.fillStyle = colors.gray;
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        ctx.fillText((120 - i * 24) + '%', padding - 10, y + 4);
    }

    // Dessiner les barres
    for (let i = 0; i < data.labels.length; i++) {
        const x = padding + i * (chartWidth / data.labels.length);
        const centerX = x + (chartWidth / data.labels.length) / 2;

        // Barre théorique (jaune)
        const theoreticalHeight = (theoretical[i] / 120) * chartHeight;
        const theoreticalY = padding + chartHeight - theoreticalHeight;

        ctx.fillStyle = colors.yellow;
        ctx.fillRect(centerX - barWidth, theoreticalY, barWidth, theoreticalHeight);

        // Contour de la barre théorique
        ctx.strokeStyle = colors.black;
        ctx.lineWidth = 1;
        ctx.strokeRect(centerX - barWidth, theoreticalY, barWidth, theoreticalHeight);

        // Barre mesurée (bleue)
        const measuredHeight = (measured[i] / 120) * chartHeight;
        const measuredY = padding + chartHeight - measuredHeight;

        ctx.fillStyle = colors.blue;
        ctx.fillRect(centerX, measuredY, barWidth, measuredHeight);

        // Contour de la barre mesurée
        ctx.strokeStyle = colors.black;
        ctx.lineWidth = 1;
        ctx.strokeRect(centerX, measuredY, barWidth, measuredHeight);

        // Étiquettes de l'axe X
        ctx.fillStyle = colors.black;
        ctx.font = '11px Arial';
        ctx.textAlign = 'center';

        // Diviser les longues étiquettes
        const label = data.labels[i];
        if (label.includes(' ')) {
            const words = label.split(' ');
            ctx.fillText(words[0], centerX, canvas.height - padding + 15);
            if (words[1]) {
                ctx.fillText(words[1], centerX, canvas.height - padding + 30);
            }
        } else {
            ctx.fillText(label, centerX, canvas.height - padding + 15);
        }

        // Valeurs au-dessus des barres
        ctx.font = '10px Arial';
        ctx.fillStyle = colors.black;

        // Valeur théorique
        ctx.fillText(data.theoretical[i] + data.units[i], centerX - barWidth/2, theoreticalY - 5);

        // Valeur mesurée
        ctx.fillText(data.measured[i] + data.units[i], centerX + barWidth/2, measuredY - 5);
    }

    // Titre du graphique
    ctx.fillStyle = colors.black;
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Comparaison Théorie vs Pratique', canvas.width / 2, 30);

    // Axe Y titre
    ctx.save();
    ctx.translate(20, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Pourcentage de la valeur théorique (%)', 0, 0);
    ctx.restore();

    // Ligne de référence à 100%
    ctx.strokeStyle = colors.yellow;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    const referenceY = padding + chartHeight - (100 / 120) * chartHeight;
    ctx.beginPath();
    ctx.moveTo(padding, referenceY);
    ctx.lineTo(canvas.width - padding, referenceY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Étiquette de la ligne de référence
    ctx.fillStyle = colors.yellow;
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Référence théorique (100%)', padding + 10, referenceY - 5);
}

/**
 * Gestion des animations au scroll (optionnel)
 */
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observer les cartes
    document.querySelectorAll('.card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

/**
 * Gestion du mode sombre (optionnel pour future amélioration)
 */
function initDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (!darkModeToggle) return;

    darkModeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    });

    // Restaurer le mode sombre
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }
}

/**
 * Validation des formulaires (pour futures extensions)
 */
function initFormValidation() {
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(form);
            console.log('Données du formulaire:', Object.fromEntries(formData));

            // Ici on pourrait ajouter la validation et l'envoi
            alert('Fonctionnalité à implémenter');
        });
    });
}

/**
 * Gestion des erreurs globales
 */
window.addEventListener('error', function(e) {
    console.error('Erreur JavaScript:', e.error);

    // En mode développement, afficher l'erreur
    if (window.location.hostname === 'localhost') {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: #ff4444;
            color: white;
            padding: 10px;
            border-radius: 5px;
            z-index: 9999;
            font-size: 12px;
            max-width: 300px;
        `;
        errorDiv.textContent = `Erreur: ${e.error.message}`;
        document.body.appendChild(errorDiv);

        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
});

/**
 * Fonctions utilitaires
 */
const utils = {
    /**
     * Formater un nombre avec des séparateurs de milliers
     */
    formatNumber: function(num) {
        return new Intl.NumberFormat('fr-FR').format(num);
    },

    /**
     * Calculer le pourcentage de différence
     */
    percentageDiff: function(theoretical, measured) {
        return ((measured - theoretical) / theoretical * 100).toFixed(1);
    },

    /**
     * Débounce une fonction
     */
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Vérifier si un élément est visible
     */
    isElementVisible: function(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
};

// Gestion du redimensionnement de fenêtre
window.addEventListener('resize', utils.debounce(function() {
    // Redessiner le graphique si la page données est active
    const dataPage = document.getElementById('donnees');
    if (dataPage && dataPage.classList.contains('active')) {
        setTimeout(initChart, 100);
    }
}, 250));

// Export des fonctions pour utilisation externe si nécessaire
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initNavigation,
        initChart,
        utils
    };
}
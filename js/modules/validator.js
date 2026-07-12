// KA Farm - Validation des entrées API
// Validation basique sans dépendance externe

export const Validator = {
  // Sanitize une chaîne de caractères
  sanitize(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/[<>]/g, '') // Supprime les tags HTML
      .replace(/[&'"]/g, (char) => {
        const map = { '&': '&', "'": '&#x27;', '"': '"' };
        return map[char];
      })
      .trim();
  },

  // Valide un email
  isEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.trim());
  },

  // Valide un numéro de téléphone sénégalais
  isPhone(phone) {
    if (!phone || typeof phone !== 'string') return false;
    // Formats: 77 123 45 67, +221 77 123 45 67, 771234567
    const cleaned = phone.replace(/[\s-]/g, '');
    const re = /^(\+221|221)?(7[5678][0-9]{7})$/;
    return re.test(cleaned);
  },

  // Valide un ID (format KA-FARM)
  isId(id) {
    if (!id || typeof id !== 'string') return false;
    return id.length >= 3 && id.length <= 50;
  },

  // Valide un nombre positif
  isPositiveNumber(value) {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0;
  },

  // Valide une date (YYYY-MM-DD)
  isDate(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return false;
    const re = /^\d{4}-\d{2}-\d{2}$/;
    if (!re.test(dateStr)) return false;
    const date = new Date(dateStr);
    return date instanceof Date && !isNaN(date);
  },

  // Valide un statut dans une liste
  isStatus(value, allowedStatuses) {
    if (!Array.isArray(allowedStatuses)) return true;
    return allowedStatuses.includes(value);
  },

  // Valide un champ requis
  required(value, fieldName) {
    if (value === null || value === undefined || value === '') {
      return `${fieldName} est requis`;
    }
    return null;
  },

  // Valide la longueur d'une chaîne
  maxLength(value, max, fieldName) {
    if (typeof value === 'string' && value.length > max) {
      return `${fieldName} ne doit pas dépasser ${max} caractères`;
    }
    return null;
  },

  // Schémas de validation par endpoint
  schemas: {
    // Messages
    postMessage: (body) => {
      const errors = [];
      
      const emailError = Validator.required(body.senderEmail, 'Email');
      if (emailError) errors.push(emailError);
      else if (!Validator.isEmail(body.senderEmail)) {
        errors.push('Email invalide');
      }

      const textError = Validator.required(body.text, 'Message');
      if (textError) errors.push(textError);
      else {
        body.text = Validator.sanitize(body.text);
        const lenError = Validator.maxLength(body.text, 2000, 'Message');
        if (lenError) errors.push(lenError);
      }

      if (body.senderName) {
        body.senderName = Validator.sanitize(body.senderName);
      }

      return { valid: errors.length === 0, errors, data: body };
    },

    // Traitements phytosanitaires
    postTreatment: (body) => {
      const errors = [];

      const idError = Validator.required(body.id, 'ID');
      if (idError) errors.push(idError);
      
      const prodError = Validator.required(body.product_name, 'Produit');
      if (prodError) errors.push(prodError);
      else {
        body.product_name = Validator.sanitize(body.product_name);
      }

      if (body.dar_days !== undefined && !Validator.isPositiveNumber(body.dar_days)) {
        errors.push('DAR doit être un nombre positif');
      }

      if (body.date_applied && !Validator.isDate(body.date_applied)) {
        errors.push('Date d\'application invalide (YYYY-MM-DD)');
      }

      return { valid: errors.length === 0, errors, data: body };
    },

    // Cultures
    postCrop: (body) => {
      const errors = [];

      const idError = Validator.required(body.id, 'ID');
      if (idError) errors.push(idError);

      const nameError = Validator.required(body.name, 'Nom');
      if (nameError) errors.push(nameError);
      else {
        body.name = Validator.sanitize(body.name);
      }

      if (body.sowingDate && !Validator.isDate(body.sowingDate)) {
        errors.push('Date de semis invalide');
      }

      if (body.harvestDate && !Validator.isDate(body.harvestDate)) {
        errors.push('Date de récolte invalide');
      }

      return { valid: errors.length === 0, errors, data: body };
    },

    // Parcelles
    postParcelle: (body) => {
      const errors = [];

      const idError = Validator.required(body.id, 'ID');
      if (idError) errors.push(idError);

      const nameError = Validator.required(body.name, 'Nom');
      if (nameError) errors.push(idError);
      else {
        body.name = Validator.sanitize(body.name);
      }

      if (body.surface !== undefined && !Validator.isPositiveNumber(body.surface)) {
        errors.push('Surface doit être un nombre positif');
      }

      if (body.lat !== undefined && (body.lat < -90 || body.lat > 90)) {
        errors.push('Latitude invalide (-90 à 90)');
      }

      if (body.lng !== undefined && (body.lng < -180 || body.lng > 180)) {
        errors.push('Longitude invalide (-180 à 180)');
      }

      return { valid: errors.length === 0, errors, data: body };
    },

    // Finances
    postFinance: (body) => {
      const errors = [];

      const idError = Validator.required(body.id, 'ID');
      if (idError) errors.push(idError);

      const descError = Validator.required(body.description, 'Description');
      if (descError) errors.push(descError);
      else {
        body.description = Validator.sanitize(body.description);
      }

      if (!body.type || !['Revenu', 'Dépense'].includes(body.type)) {
        errors.push('Type doit être "Revenu" ou "Dépense"');
      }

      if (body.amount === undefined || !Validator.isPositiveNumber(body.amount)) {
        errors.push('Montant doit être un nombre positif');
      }

      if (body.date && !Validator.isDate(body.date)) {
        errors.push('Date invalide (YYYY-MM-DD)');
      }

      return { valid: errors.length === 0, errors, data: body };
    },

    // Employees
    postEmployee: (body) => {
      const errors = [];

      const idError = Validator.required(body.id, 'ID');
      if (idError) errors.push(idError);

      const nameError = Validator.required(body.name, 'Nom');
      if (nameError) errors.push(idError);
      else {
        body.name = Validator.sanitize(body.name);
      }

      if (body.phone && !Validator.isPhone(body.phone)) {
        errors.push('Numéro de téléphone invalide (format Sénégal: 77 123 45 67)');
      }

      if (body.dailyRate !== undefined && !Validator.isPositiveNumber(body.dailyRate)) {
        errors.push('Taux journalier doit être un nombre positif');
      }

      return { valid: errors.length === 0, errors, data: body };
    },

    // Chevêtail
    postCheptel: (body) => {
      const errors = [];

      const idError = Validator.required(body.id, 'ID');
      if (idError) errors.push(idError);

      const nameError = Validator.required(body.name, 'Nom');
      if (nameError) errors.push(idError);
      else {
        body.name = Validator.sanitize(body.name);
      }

      if (body.quantity !== undefined && !Validator.isPositiveNumber(body.quantity)) {
        errors.push('Quantité doit être un nombre positif');
      }

      return { valid: errors.length === 0, errors, data: body };
    },

    // Tasks
    postTask: (body) => {
      const errors = [];

      const idError = Validator.required(body.id, 'ID');
      if (idError) errors.push(idError);

      const titleError = Validator.required(body.title, 'Titre');
      if (titleError) errors.push(titleError);
      else {
        body.title = Validator.sanitize(body.title);
      }

      if (body.dueDate && !Validator.isDate(body.dueDate)) {
        errors.push('Date d\'échéance invalide');
      }

      return { valid: errors.length === 0, errors, data: body };
    }
  },

  // Appliquer un schéma de validation
  validate(schemaName, data) {
    const schema = Validator.schemas[schemaName];
    if (!schema) {
      return { valid: true, errors: [], data };
    }
    return schema(data);
  }
};

export default Validator;
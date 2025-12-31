import React, { useState } from 'react';
import Papa from 'papaparse';
import { useTranslation } from 'react-i18next';
import { X, FileText, Check, AlertCircle } from 'lucide-react';
import './ImportModal.css';

export default function ImportModal({ isOpen, onClose, onImport }) {
  const { t } = useTranslation();
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      Papa.parse(selectedFile, {
        header: true,
        complete: (results) => {
          setData(results.data);
          setError('');
        },
        error: (err) => {
          setError(t('common.import_error') || 'Error al analizar el CSV');
        }
      });
    }
  };

  const handleConfirm = () => {
    if (data.length > 0) {
      onImport(data);
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{t('products.import')}</h3>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className="modal-body">
          <p>{t('products.import_instructions') || 'Selecciona un archivo CSV con las columnas: code, name, price, cost, stock, category_id'}</p>
          
          <div className="file-upload">
            <input type="file" accept=".csv" onChange={handleFileChange} id="csv-input" hidden />
            <label htmlFor="csv-input" className="file-label">
              <FileText size={40} />
              <span>{file ? file.name : t('common.select_file') || 'Haz clic para seleccionar un archivo'}</span>
            </label>
          </div>
          
          {data.length > 0 && (
            <div className="import-stats">
              <div className="stat">
                <Check size={16} color="#2ecc71" />
                <span>{data.length} {t('products.detected') || 'productos detectados'}</span>
              </div>
            </div>
          )}
          
          {error && (
            <div className="error-box">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>{t('common.cancel')}</button>
          <button 
            className="btn-primary" 
            onClick={handleConfirm} 
            disabled={data.length === 0}
          >
            {t('common.confirm') || 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}

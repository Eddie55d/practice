import { 
  Form, 
  FormGroup, 
  FormControl, 
  Button, 
  Alert, 
  Card, 
  CardBody,
  Spinner
} from 'react-bootstrap';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { YMaps, Map, Placemark } from '@pbe/react-yandex-maps';
import '../index.css';

export default function CreateTravel( {user} ) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};
    
    if (!title.trim()) {
      errors.title = 'Пожалуйста, введите название путешествия';
    }
    
    if (!description.trim()) {
      errors.description = 'Пожалуйста, введите описание';
    }
    
    if (!cost || isNaN(cost)) {
      errors.cost = 'Пожалуйста, введите корректную стоимость';
    }
    
    if (!location) {
      errors.location = 'Пожалуйста, выберите местоположение на карте';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/travels', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          description,
          cost: Number(cost),
          location: { 
            lat: location.lat,
            lng: location.lng
          },
          user_id: user.id // Передаем ID пользователя
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Ошибка создания путешествия');
      }

      navigate(`/travels/${data.id}/add-places`);
    } catch (err) {
      console.error('Ошибка создания путешествия:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  const handleMapClick = (e) => {
    const coords = e.get('coords');
    setLocation({ 
      lat: coords[0], 
      lng: coords[1] 
    });
    if (validationErrors.location) {
      setValidationErrors(prev => ({ ...prev, location: undefined }));
    }
  };

  return (
    <Card className="create-travel-card">
      <CardBody>
        <h2 className="text-center mb-4">Создать новое путешествие</h2>
        
        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}
        
        {Object.values(validationErrors).map((error, index) => (
          error && (
            <Alert key={index} variant="danger" className="mb-2">
              {error}
            </Alert>
          )
        ))}

        <Form onSubmit={handleSubmit}>
          <FormGroup className="mb-3">
            <FormControl
              type="text"
              placeholder="Название путешествия"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (validationErrors.title) {
                  setValidationErrors(prev => ({ ...prev, title: undefined }));
                }
              }}
              isInvalid={!!validationErrors.title}
              required
            />
          </FormGroup>

          <FormGroup className="mb-3">
            <FormControl
              as="textarea"
              rows={4}
              placeholder="Описание"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (validationErrors.description) {
                  setValidationErrors(prev => ({ ...prev, description: undefined }));
                }
              }}
              isInvalid={!!validationErrors.description}
              required
            />
          </FormGroup>

          <FormGroup className="mb-3">
            <FormControl
              type="number"
              placeholder="Стоимость (руб)"
              value={cost}
              onChange={(e) => {
                setCost(e.target.value);
                if (validationErrors.cost) {
                  setValidationErrors(prev => ({ ...prev, cost: undefined }));
                }
              }}
              isInvalid={!!validationErrors.cost}
              required
            />
          </FormGroup>

          <div className="map-container mb-3">
            <YMaps>
              <Map
                defaultState={{
                  center: [55.7558, 37.6173], // Москва по умолчанию
                  zoom: 13
                }}
                width="100%"
                height="100%"
                onClick={handleMapClick}
              >
                {location && (
                  <Placemark
                    geometry={[location.lat, location.lng]}
                    options={{
                      preset: 'islands#redDotIcon'
                    }}
                  />
                )}
              </Map>
            </YMaps>
            {validationErrors.location && (
              <div className="text-danger small mt-1">
                {validationErrors.location}
              </div>
            )}
          </div>

          <div className="d-grid">
            <Button 
              variant="primary"
              type="submit"
              disabled={loading}
              size="lg"
            >
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Создание...
                </>
              ) : 'Создать путешествие'}
            </Button>
          </div>
        </Form>
      </CardBody>
    </Card>
  );
}
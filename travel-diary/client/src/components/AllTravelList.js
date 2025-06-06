import { useEffect, useState } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Spinner, 
  Alert
} from 'react-bootstrap';
import TravelCard from './TravelCard';
import TravelDetails from './TravelDetails';
import '../index.css'

export default function AllTravelList() {
  const [travels, setTravels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedTravel, setSelectedTravel] = useState(null);

  useEffect(() => {
    const fetchTravels = async () => {
    try {
    const response = await fetch('http://localhost:5000/api/travels');
  
    if (!response.ok) {
    throw new Error('Network response was not ok');
    }
    const data = await response.json();
    setTravels(data);
    setLoading(false);
    setError(null); // Очищаем ошибку при успешном запросе
    } catch (err) {
    if (err.message === 'Failed to fetch') {
    setError('Произошла ошибка при подключении к серверу. Пожалуйста, проверьте ваше интернет-соединение и попробуйте снова.');
    } else {
    setError('Произошла непредвиденная ошибка при загрузке данных. Попробуйте обновить страницу.');
    }
    setLoading(false);
    }
    };
    
    fetchTravels();
   }, []);
   
  

  const handleCardClick = (travel) => {
    setSelectedTravel(travel);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedTravel(null); // Очищаем выбранный travel
  };

  return (
    <Container className="mt-5">
      {loading && (
        <div className="text-center mb-4">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </Spinner>
        </div>
      )}
      {error && (
        <Alert variant="danger" className="mb-4">
          Ошибка: {error}
        </Alert>
      )}
      {!loading && !error && (
        <Row>
          {travels.length === 0 && (
            <Col className="text-center">
              <Alert variant="info">Нет доступных путешествий</Alert>
            </Col>
          )}
          {travels.map(travel => (
            <Col md={4} key={travel.id} className="mb-4">
              <TravelCard 
                travel={travel} 
                onTravelClick={handleCardClick} 
              />
            </Col>
          ))}
        </Row>
      )}
      
      {selectedTravel && (
        <TravelDetails 
          show={showDetails} 
          travel={selectedTravel} 
          onClose={handleCloseDetails} 
        />
      )}
    </Container>
  );
}


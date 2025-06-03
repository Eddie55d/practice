import { useEffect, useState } from 'react';
import axios from 'axios';
import { Spinner, Alert,   ToastContainer, Toast} from 'react-bootstrap';

import { 
  Container, 
  Row, 
  Col
} from 'react-bootstrap';
import TravelCard from './TravelCard';
import TravelDetails from './TravelDetails';
import '../index.css'
export default function MyTravelsList( {user} ) {
  const [travels, setTravels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedTravel, setSelectedTravel] = useState(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);


  useEffect(() => {
    const fetchTravels = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }
  
        console.log('Sending request with token:', token);
        
        const response = await axios.get('http://localhost:5000/api/travels/my-travels', {
          headers: {
            Authorization: `Bearer ${token}`
          },
          timeout: 5000 
        });
        
        setTravels(response.data);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        } else if (err.message === 'Failed to fetch') {
          setError('Произошла ошибка при подключении к серверу. Пожалуйста, проверьте ваше интернет-соединение и попробуйте снова.');
        } else {
          setError('Произошла непредвиденная ошибка при загрузке данных. Попробуйте обновить страницу.');
        }
      } finally {
        setLoading(false);
      }
    };
  
    fetchTravels();
  }, []);
  

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const success = queryParams.get('success');
    
    if (success === 'true') {
      setShowSuccessToast(true);
      
      const timer = setTimeout(() => {
        setShowSuccessToast(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleCardClick = (travel) => {
    setSelectedTravel(travel);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedTravel(null); // Очищаем выбранный travel
  };



  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <>
      <ToastContainer className="toast-container">
        {showSuccessToast && (
          <Toast onClose={() => setShowSuccessToast(false)} delay={5000} autoHide>
            <Toast.Header>
              <strong className="mr-auto">Успех!</strong>
            </Toast.Header>
            <Toast.Body>
              Места успешно добавлены в путешествие!
            </Toast.Body>
          </Toast>
        )}
      </ToastContainer>
      
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
        
        <Row>
          {travels.length === 0 && !loading && (
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
        
        {selectedTravel && (
          <TravelDetails 
            show={showDetails} 
            travel={selectedTravel} 
            onClose={handleCloseDetails} 
          />
        )}
      </Container>
    </>
  );
}  
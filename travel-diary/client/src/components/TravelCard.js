import { 
  Card, 
  CardBody, 
  CardTitle, 
  CardText, 
  Badge, 
  Button,
  Spinner
} from 'react-bootstrap';
import { YMaps, Map, Placemark } from '@pbe/react-yandex-maps';
import { useState, useEffect } from 'react';

export default function TravelCard({ travel, onTravelClick }) {
  const hasCoordinates = travel.lat && travel.lng;
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    let timeoutId;
    
    if (!mapLoaded) {
      timeoutId = setTimeout(() => {
        setMapLoaded(true); 
      }, 2000);
    }
  
    return () => clearTimeout(timeoutId);
  }, [mapLoaded]);
  

  return (
    <Card className="mb-3">
      <CardBody>
        <div className="d-flex justify-content-between align-items-center">
          <CardTitle as="h5" className="text-truncate mb-2">
            <span className="text-truncate d-inline-block" style={{ maxWidth: '100%' }}>
              {travel.title}
            </span>
          </CardTitle>
          <Button 
            variant="outline-primary"
            size="sm"
            onClick={() => onTravelClick(travel)} 
          >
            Подробнее
          </Button>
        </div>

        <CardText className="mb-3">
          <span 
            className="text-truncate d-block" 
            style={{ 
              maxHeight: '80px', 
              overflow: 'hidden', 
              display: '-webkit-box', 
              WebkitLineClamp: '4', 
              WebkitBoxOrient: 'vertical' 
            }}
          >
            {travel.description}
          </span>
        </CardText>

        <div className="d-flex justify-content-between mb-3">
          <Badge bg="secondary">{travel.username}</Badge>
          <Badge bg="primary">₽{travel.cost}</Badge>
        </div>

        {hasCoordinates && (
          <div style={{ height: '250px', width: '100%' }}>
            <YMaps
              query={{ apikey: 'AIzaSyC4FEJpTBXLyQ9K-aUi0zJ_b6kT5uW_7iE' }}
              onload={() => setMapLoaded(true)}
              onunload={() => setMapLoaded(false)}
            >
              {mapLoaded ? (
                <Map
                  defaultState={{
                    center: [travel.lat, travel.lng],
                    zoom: 10
                  }}
                  width="100%"
                  height="100%"
                >
                  <Placemark 
                    geometry={[travel.lat, travel.lng]}
                    properties={{
                      balloonContent: travel.title
                    }}
                    options={{
                      preset: 'islands#dotIcon',
                      iconColor: '#FF0000'
                    }}
                  />
                </Map>
              ) : (
                <div className="text-center">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Загрузка карты...</span>
                  </Spinner>
                </div>
              )}
            </YMaps>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

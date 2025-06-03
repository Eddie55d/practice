import { 
  Card, 
  CardBody, 
  CardTitle, 
  CardText, 
  Badge, 
  Button
} from 'react-bootstrap';
import { YMaps, Map, Placemark } from '@pbe/react-yandex-maps';

export default function TravelCard({ travel, onTravelClick }) {
  const hasCoordinates = travel.lat && travel.lng;

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
            <YMaps>
              <Map
                defaultState={{
                  center: [travel.lat, travel.lng],
                  zoom: 13,
                }}
                width="100%"
                height="100%"
              >
                <Placemark 
                  geometry={[travel.lat, travel.lng]}
                  properties={{
                    balloonContent: travel.title,
                  }}
                  options={{
                    iconLayout: 'default#image',
                    iconImageSize: [30, 30],
                    iconImageOffset: [-15, -15]
                  }}
                />
              </Map>
            </YMaps>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
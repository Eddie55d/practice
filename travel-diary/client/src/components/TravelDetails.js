import React from "react";
import {
  Modal,
  ModalBody,
  ListGroup,
  ListGroupItem,
  Card,
  CardBody,
  CardText,
  Badge,
  Alert,
} from "react-bootstrap";
import { YMaps, Map, Placemark } from "@pbe/react-yandex-maps";

const TravelDetails = ({ show, travel, onClose }) => {
  const isValidCoordinate = (lat, lng) => {
    return (
      lat !== undefined &&
      lng !== undefined &&
      !isNaN(lat) &&
      !isNaN(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    );
  };

  const handleMapError = (error) => {
    console.error("Ошибка карты:", error);
  };

  const modalBodyStyle = {
    maxHeight: "80vh",
    overflowY: "auto",
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <ModalBody style={modalBodyStyle}>
        <Card>
          <CardBody>
            <CardText className="fs-5">{travel.description}</CardText>

            {travel.places_to_visit && (
              <div className="mt-4">
                <h4 className="mb-3">Места для посещения:</h4>
                <ListGroup variant="flush">
                  {travel.places_to_visit.map((place) => (
                    <ListGroupItem key={place.id} className="py-3">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h5 className="mb-2">{place.name}</h5>
                          <p className="mb-3">{place.description}</p>
                        </div>
                        {place.is_visited ? (
                          <Badge bg="success" className="ms-2">
                            Посещено
                          </Badge>
                        ) : (
                          <Badge bg="warning" className="ms-2">
                            Не посещено
                          </Badge>
                        )}
                      </div>

                      {isValidCoordinate(place.lat, place.lng) ? (
                        <div
                          className="mt-3"
                          style={{
                            height: "300px",
                            borderRadius: "8px",
                            overflow: "hidden",
                          }}
                        >
                          <YMaps>
                            <Map
                              defaultState={{
                                center: [place.lat || 0, place.lng || 0],
                                zoom: 14,
                              }}
                              width="100%"
                              height="100%"
                              onError={handleMapError}
                            >
                              <Placemark
                                geometry={[place.lat, place.lng]}
                                properties={{
                                  balloonContent: place.name,
                                }}
                                options={{
                                  preset: "islands#darkBlueDotIcon",
                                }}
                              />
                            </Map>
                          </YMaps>
                        </div>
                      ) : (
                        <Alert variant="warning" className="mt-3">
                          Координаты места недоступны
                        </Alert>
                      )}
                    </ListGroupItem>
                  ))}
                </ListGroup>
              </div>
            )}
          </CardBody>
        </Card>
      </ModalBody>
    </Modal>
  );
};

export default TravelDetails;

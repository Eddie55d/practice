import {
  FormGroup,
  FormControl,
  Button,
  ListGroup,
  ListGroupItem,
  Card,
  CardBody,
  Alert,
  Toast,
  ToastContainer,
  FormCheck
} from "react-bootstrap";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { YMaps, Map, Placemark } from "@pbe/react-yandex-maps";
import "../index.css"; // Подключаем стили

export default function AddPlaces() {
  const [placeName, setPlaceName] = useState("");
  const [placeDescription, setPlaceDescription] = useState("");
  const [placeLocation, setPlaceLocation] = useState(null);
  const [isVisited, setIsVisited] = useState(false);
  const [addedPlaces, setAddedPlaces] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [error, setError] = useState(null);
  const { id } = useParams();
  const [travelId, setTravelId] = useState(null);
  const [showToast, setShowToast] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      setTravelId(id);
      console.log("Travel ID:", id); // Для отладки
    }
  }, [id]);

  useEffect(() => {
    // Показываем Toast при первом рендере
    setShowToast(true);

    // Автоматически скрываем Toast через 5 секунд
    const timer = setTimeout(() => {
      setShowToast(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handlePlaceMapClick = (e) => {
    const coords = e.get("coords");
    setPlaceLocation({
      lat: coords[0],
      lng: coords[1],
    });
    // Очищаем ошибку местоположения при выборе
    if (validationErrors.location) {
      setValidationErrors((prev) => ({ ...prev, location: undefined }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!placeName.trim()) {
      errors.name = "Пожалуйста, введите название места";
    }

    if (!placeDescription.trim()) {
      errors.description = "Пожалуйста, введите описание";
    }

    if (!placeLocation) {
      errors.location = "Пожалуйста, выберите местоположение на карте";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddPlace = () => {
    if (!validateForm()) return;

    console.log('Current isVisited state:', isVisited);

    try {
      const newPlace = {
        id: Date.now(), // Уникальный идентификатор
        name: placeName,
        description: placeDescription,
        location: placeLocation,
        isVisited: isVisited,
      };

      console.log('Adding place with visited status:', isVisited);

      setAddedPlaces([...addedPlaces, newPlace]);
      resetForm();
    } catch (err) {
      handleServerError(err);
    }
  };

  const resetForm = () => {
    setPlaceName("");
    setPlaceDescription("");
    setPlaceLocation(null);
    setIsVisited(false); 
    setValidationErrors({});
  };

  const handleSavePlaces = async () => {
    if (!travelId) {
      setError("Не удалось определить ID путешествия");
      return;
    }

    try {
      // Transform the data to match backend expectations
      const placesToSend = addedPlaces.map((place) => ({
        name: place.name,
        description: place.description,
        location: {
          lng: place.location.lng,
          lat: place.location.lat,
        },
        is_visited: place.isVisited,
      }));

      const response = await fetch(
        `http://localhost:5000/api/travels/${travelId}/places`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(placesToSend),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Ошибка сохранения мест");
      }

      navigate('/my-travels?success=true');
    } catch (err) {
      console.error("Save places error:", err);
      setError(err.message);
    }
  };

  const handleRemovePlace = (id) => {
    setAddedPlaces(addedPlaces.filter((place) => place.id !== id));
  };

  const handleServerError = (error) => {
    if (error.response && error.response.status === 401) {
      // Если пользователь не авторизован
      localStorage.removeItem("token");
      window.location.href = "/login";
    } else {
      setError(error.message || "Произошла ошибка при добавлении места");
    }
  };

  return (
    <div>
      <ToastContainer
        className="toast-container"
        position="fixed"
        style={{ zIndex: 1000 }}
      >
        {showToast && (
          <Toast onClose={() => setShowToast(false)} delay={5000} autoHide>
            <Toast.Header>
              <strong className="mr-auto">Успех!</strong>
            </Toast.Header>
            <Toast.Body>
              Путешествие создано! Добавьте места посещения.
            </Toast.Body>
          </Toast>
        )}
      </ToastContainer>

      <Card className="add-places-form">
        <CardBody>
          <h4 className="mb-4">Добавить места посещения</h4>
          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}
          {Object.values(validationErrors).map(
            (error, index) =>
              error && (
                <Alert key={index} variant="danger" className="mb-2">
                  {error}
                </Alert>
              )
          )}
          <FormGroup className="mb-3">
            <FormControl
              type="text"
              placeholder="Название места"
              value={placeName}
              onChange={(e) => {
                setPlaceName(e.target.value);
                if (validationErrors.name) {
                  setValidationErrors((prev) => ({ ...prev, name: undefined }));
                }
              }}
              isInvalid={!!validationErrors.name}
              required
            />
          </FormGroup>
          <FormGroup className="mb-3">
            <FormControl
              as="textarea"
              rows={3}
              placeholder="Описание места"
              value={placeDescription}
              onChange={(e) => {
                setPlaceDescription(e.target.value);
                if (validationErrors.description) {
                  setValidationErrors((prev) => ({
                    ...prev,
                    description: undefined,
                  }));
                }
              }}
              isInvalid={!!validationErrors.description}
              required
            />
          </FormGroup>
          <FormGroup className="mb-3">
            <FormCheck
              type="checkbox"
              label="Место посещено"
              checked={isVisited}
              onChange={(e) => setIsVisited(e.target.checked)}
            />
          </FormGroup>
          {/* Карта для выбора местоположения */}
          <div className="map-container mb-3">
            <YMaps>
              <Map
                defaultState={{
                  center: [55.7558, 37.6173], // Москва по умолчанию
                  zoom: 13,
                }}
                width="100%"
                height="100%"
                onClick={handlePlaceMapClick}
              >
                {placeLocation && (
                  <Placemark
                    geometry={[placeLocation.lat, placeLocation.lng]}
                    options={{
                      preset: "islands#blueDotIcon",
                    }}
                  />
                )}
              </Map>
            </YMaps>
          </div>
          <div className="d-grid mb-4">
            <Button
              variant="primary"
              onClick={handleAddPlace}
              disabled={!placeName || !placeDescription || !placeLocation}
            >
              Добавить место
            </Button>
          </div>
          {addedPlaces.length > 0 && (
            <div className="place-list">
              <h4 className="mb-3">Добавленные места</h4>
              <ListGroup variant="flush">
                {addedPlaces.map((place) => (
                  <ListGroupItem key={place.id} className="py-3">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h5 className="mb-2">{place.name}</h5>
                        <p className="mb-2">{place.description}</p>
                        <small className="text-muted">
                          Координаты: {place.location.lat.toFixed(4)},{" "}
                          {place.location.lng.toFixed(4)}
                        </small>
                      </div>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleRemovePlace(place.id)}
                      >
                        Удалить
                      </Button>
                      <Button
                          variant={place.isVisited ? "outline-success" : "outline-warning"}
                          size="sm"
                          onClick={() => {
                            const updatedPlaces = addedPlaces.map(p => 
                              p.id === place.id 
                                ? {...p, isVisited: !p.isVisited} 
                                : p
                            );
                            setAddedPlaces(updatedPlaces);
                          }}
                        >
                          {place.isVisited ? "Посещено" : "Не посещено"}
                        </Button>
                    </div>
                  </ListGroupItem>
                ))}
              </ListGroup>
              <Button
                variant="success"
                onClick={handleSavePlaces}
                className="mt-3"
              >
                Сохранить все места
              </Button>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  FlatList,
  StyleSheet,
  Text,
  View,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Button
} from 'react-native';

export default function App() {
  const [data, setData] = useState([]);               
  const [filteredData, setFilteredData] = useState([]); 
  const [loading, setLoading] = useState(false);      
  const [page, setPage] = useState(1);             
  const [loadingMore, setLoadingMore] = useState(false);  
  const [isEndReached, setIsEndReached] = useState(false);  
  const [visibleDetails, setVisibleDetails] = useState({}); 
  const urlBase = 'https://rickandmortyapi.com/api';


  const getCharacters = async () => {
    if (loading || isEndReached) return;
    setLoadingMore(true);
    try {
      const response = await fetch(`${urlBase}/character?page=${page}`);
      const json = await response.json();
      if (!json.info?.next) setIsEndReached(true);
      const newData = [...data, ...json.results];
      setData(newData);
      setFilteredData(newData);
      setPage(page + 1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };


  const getLastEpisodeName = async (episodeUrl) => {
    try {
      const response = await fetch(episodeUrl);
      const json = await response.json();
      return json.name || 'Desconocido';
    } catch {
      return 'Desconocido';
    }
  };

  
  const updateLastEpisodes = async () => {
    const updatedData = await Promise.all(
      data.map(async (item) => ({
        ...item,
        lastEpisode: await getLastEpisodeName(item.episode[item.episode.length - 1]),
      }))
    );
    setData(updatedData);
    setFilteredData(updatedData);
  };

  useEffect(() => {
    if (data.length) updateLastEpisodes();
  }, [data]);

  const toggleDetails = (id) => {
    setVisibleDetails(prevState => ({ ...prevState, [id]: !prevState[id] }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <Button title="Cargar personajes" onPress={getCharacters} disabled={loading || isEndReached} />

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={filteredData} 
          renderItem={({ item }) => (
            <TouchableOpacity key={item.id} style={styles.gridItem} onPress={() => toggleDetails(item.id)}>
              <Image source={{ uri: item.image }} style={styles.characterImage} />
              <Text style={styles.characterName}>{item.name}</Text>
              {visibleDetails[item.id] && (
                <View>
                  <Text style={styles.characterDetail}>Estado: {item.status}</Text>
                  <Text style={styles.characterDetail}>Género: {item.gender}</Text>
                  <Text style={styles.characterDetail}>Última aparición: {item.lastEpisode}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}  
          onEndReached={() => !loadingMore && getCharacters()}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loadingMore && <ActivityIndicator size="small" />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0', padding: 10 },
  gridItem: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 5,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
  },
  characterImage: { width: 100, height: 100, borderRadius: 50 },
  characterName: { fontSize: 16, fontWeight: 'bold', marginVertical: 5 },
  characterDetail: { fontSize: 14, color: '#666', textAlign: 'center' },
});

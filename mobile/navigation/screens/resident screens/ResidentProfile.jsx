import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { getResidents } from '../../services/api';

const QUICK_FILTERS = [
  { id: 'condition', label: 'By Condition', icon: <Ionicons name="heart-outline" size={15} color="#8B5E3C" /> },
  { id: 'medication', label: 'By Medication', icon: <MaterialCommunityIcons name="briefcase-outline" size={15} color="#8B5E3C" /> },
  { id: 'room',      label: 'By Room',      icon: <Ionicons name="pricetag-outline" size={15} color="#8B5E3C" /> },
]

export default function SearchResidents({ navigation }) {
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState(null)
  const [residents, setResidents] = useState([])
  const [recentSearches, setRecentSearches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadResidents()
    loadRecentSearches()
  }, [])

  const loadResidents = async () => {
    setLoading(true)
    try {
      const response = await getResidents()
      const residentsData = response.data || []
      setResidents(residentsData.map(resident => ({
        id: resident._id,
        name: `${resident.firstName} ${resident.lastName}`,
        room: `Room ${resident.roomNumber || 'N/A'}`,
        tags: resident.conditions ? resident.conditions.join(', ') : null,
        ...resident
      })))
    } catch (error) {
      console.error('Error loading residents:', error)
      Alert.alert('Error', 'Failed to load residents')
    } finally {
      setLoading(false)
    }
  }

  const loadRecentSearches = async () => {
    try {
      const stored = await AsyncStorage.getItem('recentSearches')
      if (stored) {
        setRecentSearches(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Error loading recent searches:', error)
    }
  }

  const saveRecentSearch = async (searchTerm) => {
    try {
      const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 3)
      setRecentSearches(updated)
      await AsyncStorage.setItem('recentSearches', JSON.stringify(updated))
    } catch (error) {
      console.error('Error saving recent search:', error)
    }
  }

  const filtered = residents.filter((r) => {
    if (!query) return true
    const q = query.toLowerCase()
    return (
      r.name.toLowerCase().includes(q) ||
      r.room.toLowerCase().includes(q) ||
      (r.tags && r.tags.toLowerCase().includes(q))
    )
  })

  const handleSearchSubmit = () => {
    if (query.trim()) {
      saveRecentSearch(query.trim())
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E1903A" />
        <Text style={styles.loadingText}>Loading residents...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#E45C2B" />
        </TouchableOpacity>
        <Text style={styles.title}>Search Residents</Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color="#BBB" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, room or condition"
          placeholderTextColor="#BBB"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={18} color="#CCC" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Recent searches — only when no query */}
        {query.length === 0 && recentSearches.length > 0 && (
          <View style={styles.recentCard}>
            {recentSearches.map((s, i) => (
              <TouchableOpacity
                key={s}
                style={[styles.recentRow, i < recentSearches.length - 1 && styles.recentBorder]}
                onPress={() => setQuery(s)}
              >
                <Ionicons name="time-outline" size={18} color="#8B5E3C" />
                <Text style={styles.recentText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Quick Filters */}
        <Text style={styles.filterLabel}>Quick Filters</Text>
        <View style={styles.filterRow}>
          {QUICK_FILTERS.map((f) => (
            <TouchableOpacity
              key={f.id}
              style={[styles.filterChip, activeFilter === f.id && styles.filterChipActive]}
              onPress={() => setActiveFilter(activeFilter === f.id ? null : f.id)}
            >
              {f.icon}
              <Text style={[styles.filterText, activeFilter === f.id && styles.filterTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Resident list */}
        <View style={styles.residentList}>
          {filtered.map((r) => (
            <TouchableOpacity
              key={r.id}
              style={styles.residentCard}
              onPress={() => navigation?.navigate("ResidentOverview", { resident: r })}
            >
              <View style={styles.residentAvatar}>
                <Ionicons name="person" size={22} color="#AAA" />
              </View>
              <View style={styles.residentInfo}>
                <Text style={styles.residentName}>{r.name}</Text>
                <Text style={styles.residentRoom}>{r.room}</Text>
                {r.tags && <Text style={styles.residentTags}>{r.tags}</Text>}
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CCC" />
            </TouchableOpacity>
          ))}
          {filtered.length === 0 && (
            <Text style={styles.emptyText}>
              {query ? 'No residents found matching your search.' : 'No residents available.'}
            </Text>
          )}
        </View>

      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EFEFEF",
    paddingTop: 50,
    paddingHorizontal: 16,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EFEFEF",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#7A4A2E",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 15,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#7A4A2E",
    marginLeft: 12,
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },

  scrollContent: {
    paddingBottom: 30,
  },

  // Recent searches
  recentCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },

  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  recentBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },

  recentText: {
    fontSize: 14,
    color: '#444',
  },

  // Quick filters
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 10,
  },

  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },

  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3E2',
    borderWidth: 1.5,
    borderColor: '#E8D8B8',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },

  filterChipActive: {
    backgroundColor: '#E1903A',
    borderColor: '#C97020',
  },

  filterText: {
    fontSize: 13,
    color: '#8B5E3C',
    fontWeight: '600',
  },

  filterTextActive: {
    color: '#FFF',
  },

  // Resident list
  residentList: {
    gap: 10,
  },

  residentCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },

  residentAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
  },

  residentInfo: {
    flex: 1,
  },

  residentName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222',
    marginBottom: 2,
  },

  residentRoom: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },

  residentTags: {
    fontSize: 12,
    color: '#B07040',
  },

  emptyText: {
    textAlign: 'center',
    color: '#AAA',
    fontSize: 14,
    paddingVertical: 20,
  },
})
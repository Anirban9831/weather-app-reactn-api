import { StatusBar } from "expo-status-bar";
import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  StyleSheet,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { Image } from "react-native";
import { theme } from "../theme";
import {
  CalendarDaysIcon,
  MagnifyingGlassIcon,
} from "react-native-heroicons/outline";

import { MapPinIcon } from "react-native-heroicons/solid";
import { debounce } from "lodash";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { fetchLocations, fetchWeatherForecast } from "../api/weather";
import * as Progress from "react-native-progress";

export default function HomeScreen() {
  const [showSearch, toggleSearch] = useState(false);
  const [locations, setlocations] = useState([]);
  const [weather, setWeather] = useState({});
  const [loading, setLoading] = useState(true);

  const handleLocation = (loc) => {
    console.log("location : ", loc);
    setlocations([]);
    toggleSearch(false);
    setLoading(true);
    fetchWeatherForecast({
      cityName: loc.name,
      days: "7",
    }).then((data) => {
      setWeather(data);
      setLoading(false);
      console.log("got forecast: ", data);
    });
  };

  const handleSearch = async (value) => {
    if (value.length > 2) {
      try {
        const data = await fetchLocations({ cityName: value });
        if (data) {
          setlocations(data);
        }
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    }
  };
  useEffect(() => {
    fetchMyWeatherData();
  }, []);

  const fetchMyWeatherData = async () => {
    fetchWeatherForecast({
      cityName: "Kolkata",
      days: "7",
    }).then((data) => {
      setWeather(data);
      setLoading(false);
    });
  };
  const handleTextDebounce = useCallback(debounce(handleSearch, 1000), []);
  const { current, location } = weather;

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      extraScrollHeight={20} // Adjust based on your needs
    >
      <View className="flex-1 relative">
        <StatusBar style="light" />
        <Image
          blurRadius={50}
          source={require("../assets/images/bg.png")}
          className="absolute h-full w-full"
        />
        {loading ? (
          <View className="flex-1 flex-row justify-center items-center">
            <Progress.CircleSnail thickness={10} size={140} color="#0bb3b2" />
          </View>
        ) : (
          <SafeAreaView className="flex flex-1">
            {/*search section*/}
            <View style={{ height: "7%" }} className="pt-8 mx-4 relative z-50">
              <View
                className="flex-row justify-end items-center rounded-full"
                style={{
                  backgroundColor: showSearch
                    ? theme.bgWhite(0.2)
                    : "transparent",
                }}
              >
                {showSearch ? (
                  <TextInput
                    onChangeText={handleTextDebounce}
                    placeholder="Search city"
                    placeholderTextColor={"lightgray"}
                    className="pl-5 h-10 flex-1 text-base text-white"
                  />
                ) : null}

                <TouchableOpacity
                  onPress={() => toggleSearch(!showSearch)}
                  style={{ backgroundColor: theme.bgWhite(0.2) }}
                  className="rounded-full p-1 m-1"
                >
                  <MagnifyingGlassIcon
                    size="30"
                    color="white"
                  ></MagnifyingGlassIcon>
                </TouchableOpacity>
              </View>
              {locations.length > 0 && showSearch ? (
                <View className="absolute w-full bg-gray-300 top-20 rounded-3xl pb-4">
                  {locations.map((loc, index) => {
                    let showBorder = index + 1 != locations.length;
                    let borderClass = showBorder
                      ? "border-b-2 border-b-gray-400"
                      : "";
                    return (
                      <TouchableOpacity
                        onPress={() => handleLocation(loc)}
                        key={index}
                        className={
                          "flex-row items-center border-0 p-3 px-4 mb-1 " +
                          borderClass
                        }
                      >
                        <MapPinIcon size="20" color="gray"></MapPinIcon>
                        <Text className="text-black text-lg ml-2 ">
                          {loc?.name},{loc?.country}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : null}
            </View>
            {/*forecast section */}
            <View className="mx-4 flex justify-around flex-1 mb-2 pb-4">
              {/*Location details */}
              <Text className="text-white text-center text-2xl font-bold pt-8">
                {location?.name},
                <Text className="text-lg font-semibold text-gray-300">
                  {" " + location?.country}
                </Text>
              </Text>
              {/*Image */}
              <View className="flex-1 justify-center items-center">
                {current ? (
                  <>
                    {/* Icon */}
                    <View className="flex-row justify-center mb-4">
                      <Image
                        source={{ uri: `https:${current?.condition?.icon}` }}
                        className="w-52 h-52"
                        style={{ resizeMode: "contain" }} // Ensures the image scales correctly
                      />
                    </View>

                    {/* Degree Celsius */}
                    <View className="space-y-2">
                      <Text className="text-center font-bold text-white text-6xl">
                        {current?.temp_c}&#176;c
                      </Text>
                      <Text className="text-center text-white text-xl tracking-widest">
                        {current?.condition?.text}
                      </Text>
                    </View>
                  </>
                ) : (
                  <Text className="text-center text-white text-lg">
                    Loading...
                  </Text>
                )}
              </View>
              {/*Other stats */}
              <View className="flex-row justify-between mx-4">
                <View className="flex-row space-x-2 items-center">
                  <Image
                    source={require("../assets/icons/wind.png")}
                    className="h-6 w-6"
                  ></Image>
                  <Text className="text-white font-semibold text-base">
                    {current?.wind_kph} km
                  </Text>
                </View>
                <View className="flex-row space-x-2 items-center">
                  <Image
                    source={require("../assets/icons/drop.png")}
                    className="h-6 w-6"
                  ></Image>
                  <Text className="text-white font-semibold text-base">
                    {current?.humidity} %
                  </Text>
                </View>
                <View className="flex-row space-x-2 items-center">
                  <Image
                    source={require("../assets/images/clock.png")}
                    className="h-6 w-6"
                  ></Image>
                  <Text className="text-white font-semibold text-base">
                    {current?.last_updated.split(" ")[1]}
                  </Text>
                </View>
              </View>
            </View>

            {/*Forecast for next days*/}
            <View className="mb-2 space-y-3">
              <View className="flex-row items-center mx-5 space-x-2">
                <CalendarDaysIcon size="22" color="white" />
                <Text className="text-white text-base">Daily forecast</Text>
              </View>
              <ScrollView
                horizontal
                contentContainerStyle={{ paddingHorizontal: 15 }}
                showsHorizontalScrollIndicator={false}
              >
                {weather?.forecast?.forecastday?.map((item, index) => {
                  let date = new Date(item.date);
                  let options = { weekday: "long" };
                  let dayName = date.toLocaleDateString("en-US", options);
                  return (
                    <View
                      key={index}
                      className="flex justify-center items-center w-24 rounded-3xl py-3 space-y-1 mr-4"
                      style={{ backgroundColor: theme.bgWhite(0.15) }}
                    >
                      <Image
                        source={{ uri: `https:${item?.day?.condition?.icon}` }}
                        className="h-11 w-11"
                      />
                      <Text className="text-white">{dayName}</Text>
                      <Text className="text-white text-xl font-semibold">
                        {item?.day?.avgtemp_c}&#176;
                      </Text>
                    </View>
                    //1st day
                  );
                })}
              </ScrollView>
            </View>
          </SafeAreaView>
        )}
      </View>
    </KeyboardAwareScrollView>
  );
}

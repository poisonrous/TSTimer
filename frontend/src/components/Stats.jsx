import CardNumber from '../components/CardNumber';
import { FaUsers, FaCalendarAlt } from "react-icons/fa";
import { FaMusic } from "react-icons/fa6";
import { MdLibraryMusic } from "react-icons/md";
import { useState, useEffect } from "react";
import Dropdown from '../components/Dropdown';
import { PieChart } from "@mui/x-charts/PieChart";
import { BarChart } from "@mui/x-charts/BarChart";
import React from "react";
import Swal from 'sweetalert2';
import useWindowSize from '../utils/useWindowSize';

const Stats = () => {

  const size = useWindowSize();
  const isMobile = size.width <= 768;

  const pieChartSize = 300;

  const periods = ["Last 4 weeks", "Last 6 months", "All time"];
  const [selectedPeriod, setSelectedPeriod] = useState(periods[0]);
  const [statsData, setStatsData] = useState({
    playlistsCreated: 0,
    visitors: 0,
    minutesOfMusic: 0,
    countries: [],
    savedPlaylists: 0,
  });

  const animateValue = (start, end, duration, callback) => {
    let startTime = null;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      callback(Math.floor(progress * (end - start) + start));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  };

  const showLoading = () => {
    Swal.fire({
      title: 'Loading...',
      text: 'Fetching the latest stats for you!',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  };

  const hideLoading = () => {
    Swal.close();
  };

  const handleSelect = (period) => {
    setSelectedPeriod(period);
  };

  useEffect(() => {
    const fetchData = async () => {
      showLoading(); // Mostrar el indicador de carga
      try {
        const response = await fetch(`/api/stats?period=${selectedPeriod}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Animar la actualización de las estadísticas
        animateValue(0, data.playlistsCreated, 1000, (value) => setStatsData((prevData) => ({ ...prevData, playlistsCreated: value })));
        animateValue(0, data.visitors, 1000, (value) => setStatsData((prevData) => ({ ...prevData, visitors: value })));
        animateValue(0, data.minutesOfMusic, 1000, (value) => setStatsData((prevData) => ({ ...prevData, minutesOfMusic: value })));
        animateValue(0, data.savedPlaylists, 1000, (value) => setStatsData((prevData) => ({ ...prevData, savedPlaylists: value })));
        setStatsData((prevData) => ({ ...prevData, countries: data.countries }));
      } catch (error) {
        console.error('Error al obtener estadísticas:', error);
      } finally {
        hideLoading(); // Ocultar el indicador de carga
      }
    };

    fetchData();
  }, [selectedPeriod]);

  const pieChartData = [
    { value: statsData.savedPlaylists, color: "darkslateblue" },
    { value: statsData.playlistsCreated - statsData.savedPlaylists, color: "rgba(72, 61, 139, 0.3)" }
  ];

  return (
      <div>
        <div className={"filter"}>
          <Dropdown
              title={"Period"}
              options={periods}
              selectedOption={selectedPeriod}
              onSelect={handleSelect}
              Icon={FaCalendarAlt}
          />
        </div>
        <span></span>
        <div className={"statistics-first-row"}>
          <CardNumber
              number={statsData.playlistsCreated}
              descriptor={"Playlists created"}
              Icon={MdLibraryMusic}
          />
          <CardNumber
              number={statsData.visitors}
              descriptor={"Visitors"}
              Icon={FaUsers}
          />
          <CardNumber
              number={statsData.minutesOfMusic}
              descriptor={"Minutes of music"}
              Icon={FaMusic}
          />
        </div>
        <div className={'second-row'}>
          <div className={'card'}>
            <h2>Saved Playlists</h2>
            <div className={"custom-pie"} style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: pieChartSize,
              height: pieChartSize,
              position: 'relative'
            }}>
              <PieChart
                  series={[
                    {
                      innerRadius: "50%",
                      outerRadius: "100%",
                      arcLabel: () => null,
                      data: pieChartData,
                      cx: 140,
                    },
                  ]}
                  width={pieChartSize}
                  height={pieChartSize}
              />
              <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "darkslateblue",
                  }}
              >
                {`${(statsData.savedPlaylists / statsData.playlistsCreated * 100).toFixed(2)}%`}
              </div>
            </div>
          </div>
          <div className={"card"}>
            <h2>Countries</h2>
            <BarChart
                series={[{data: statsData.countries.map(item => item.value), color: "darkslateblue"}]}
                xAxis={isMobile ? [{
                  data: statsData.countries.map(item => item.label),
                  scaleType: "band",
                  barGapRatio: 1.0
                }] : []}
                yAxis={!isMobile ? [{
                  data: statsData.countries.map(item => item.label),
                  scaleType: "band",
                  barGapRatio: 1.0
                }] : []}
                height={isMobile ? 400 : 250}
                width={isMobile ? 300 : 560}
                layout={isMobile ? "vertical" : "horizontal"}
                margin={{ left: 100 }}
            />
          </div>
        </div>
      </div>
  );
};

export default Stats;

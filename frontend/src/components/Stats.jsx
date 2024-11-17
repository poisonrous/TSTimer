import CardNumber from '../components/CardNumber';
import { FaUsers, FaCalendarAlt } from "react-icons/fa";
import { FaMusic } from "react-icons/fa6";
import { MdLibraryMusic } from "react-icons/md";
import { useState, useEffect } from "react";
import Dropdown from '../components/Dropdown';
import { PieChart } from "@mui/x-charts/PieChart";
import { BarChart } from "@mui/x-charts/BarChart";
import React from "react";
const Stats = () => {
  const periods = ["Last 4 weeks", "Last 6 months", "All time"];
  const [selectedPeriod, setSelectedPeriod] = useState(periods[0]);
  const [statsData, setStatsData] = useState({
    playlistsCreated: 0,
    visitors: 0,
    minutesOfMusic: 0,
    countries: [],
    accuracy: 0,
  });

  const handleSelect = (period) => {
    setSelectedPeriod(period);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/stats?period=${selectedPeriod}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setStatsData(data);
      } catch (error) {
        console.error('Error al obtener estadísticas:', error);
      }
    };

    fetchData();
  }, [selectedPeriod]);

  const pieChartData = [
    { value: statsData.accuracy, color: "darkslateblue" },
    { value: 100 - statsData.accuracy, color: "rgba(72, 61, 139, 0.3)" }
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
            <h2>Accuracy</h2>
            <div
                className={"custom-pie"}
                style={{ position: "relative", width: 250, height: 250 }}
            >
              <PieChart
                  series={[
                    {
                      innerRadius: "50%",
                      outerRadius: "100%",
                      arcLabel: () => null,
                      data: pieChartData,
                    },
                  ]}
                  width={250}
                  height={250}
              />
              <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-120%, -50%)",
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "darkslateblue",
                  }}
              >
                {statsData.accuracy}%
              </div>
            </div>
          </div>
          <div className={"card"}>
            <h2>Countries</h2>
            <BarChart
                series={[{ data: statsData.countries.map(item => item.value), color: "darkslateblue" }]}
                yAxis={[{
                  data: statsData.countries.map(item => item.label),
                  scaleType: "band",
                  barGapRatio: 1.0
                }]}
                height={250}
                width={560}
                layout={"horizontal"}
                margin={{ left: 100 }}
            />
          </div>
        </div>
      </div>
  );
};

export default Stats;


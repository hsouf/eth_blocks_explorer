import "./App.css";
import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { INFURA_GATEWAY } from "./config.js";
import { Button, Card } from "@mui/material";
import ClipLoader from "react-spinners/ClipLoader";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

function App() {
  const [data, setData] = useState({});
  const [fetchData, setFetchData] = useState(true);

  async function loadWeb3() {
    window.web3 = new Web3(INFURA_GATEWAY);
  }

  async function loadBlockData() {
    const web3 = window.web3;
    const currentBlockNumber = await web3.eth.getBlockNumber();
    const { miner, totalDifficulty, transactions } = await web3.eth.getBlock(
      currentBlockNumber
    );
    let blockTransactions = [];
    for (var i = 0; i < transactions.length; i++) {
      const { value, from } = await web3.eth.getTransaction(transactions[i]);

      blockTransactions.push({
        value: web3.utils.fromWei(value),
        from: from,
        hash: transactions[i],
      });
    }

    setData({
      currentBlockNumber: currentBlockNumber,
      miner: miner,
      size: transactions.length,
      totalDifficulty: totalDifficulty,
      transactions: blockTransactions.sort(function (a, b) {
        return b.value - a.value;
      }),
    });
  }

  useEffect(() => {
    loadWeb3();
  }, []);

  useEffect(() => {
    loadBlockData();
    const interval = setInterval(() => {
      if (fetchData) {
        loadBlockData();
      }
    }, 15000);
    return () => {
      clearInterval(interval);
    };
  }, [fetchData]);

  const handleClick = () => {
    setFetchData(!fetchData);
  };

  return (
    <div className="App">
      <Card variant="outlined" sx={{ minWidth: 375 }}>
        <div className="Loading">
          <ClipLoader color={"black"} loading={fetchData} css={""} size={50} />
          <p>Waiting for next block data {fetchData ? "..." : "was paused!"}</p>
        </div>
        <p className="Title">Ethereum Blocks Explorer</p>
        <div>
          <p>
            Current block: <span>#{data?.currentBlockNumber}</span>
          </p>
          <p>
            Total transactions: <span>{data?.size}</span>
          </p>
          <p>
            Miner: <span>{data?.miner}</span>
          </p>
          <p>
            TotalDifficulty: <span>{data?.totalDifficulty}</span>
          </p>
        </div>
        <Button
          variant="contained"
          size="large"
          style={{ margin: "5px" }}
          onClick={() => handleClick()}
          color={fetchData ? "error" : "primary"}
        >
          {fetchData ? "PAUSE" : "Resume Fetching Block Data"}
        </Button>
      </Card>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Transaction Hash</TableCell>
              <TableCell>From</TableCell>
              <TableCell>Value</TableCell>
              <TableCell>Block Number</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.transactions.length === 0 && (
              <div className="Loading">
                <ClipLoader
                  color={"black"}
                  loading={fetchData}
                  css={""}
                  size={50}
                />
                <p>Fetching transactions data...</p>
              </div>
            )}
            {data.transactions.map((row, i) => (
              <TableRow
                key={i}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.hash}
                </TableCell>
                <TableCell align="th">{row.from}</TableCell>
                <TableCell align="th">{row.value} Ether</TableCell>
                <TableCell align="th">{data.currentBlockNumber} </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default App;

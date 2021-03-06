import React, { FC, useCallback } from 'react';
import { styled } from '@mui/material/styles';

import {
  Dialog,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton,
  DialogTitle,
  DialogContent,
} from '@mui/material';


import { PretifyCommaNumber } from '../../components/Tools/PretifyCommaNumber';
import { MakeLinkableAddress, ValidateAddress } from '../../components/Tools/WalletAddress'; // global key handling

import HelpIcon from '@mui/icons-material/Help';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

function trimAddress(addr: string) {
    if (!addr) return addr;
    let start = addr.substring(0, 8);
    let end = addr.substring(addr.length - 4);
    return `${start}...${end}`;
}

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

export interface DialogTitleProps {
  id: string;
  children?: React.ReactNode;
  onClose: () => void;
}

const BootstrapDialogTitle = (props: DialogTitleProps) => {
  const { children, onClose, ...other } = props;

  return (
    <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
      {children}
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
};

export default function TopHolders(props: any) {
    const [open, setOpen] = React.useState(false);
    const [largestAccounts, setLargestAccounts] = React.useState(null);
    const mint = props.mint;
    const logoURI = props.logoURI;
    const name = props.name;
    
    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };

    const GetLargestTokenAccounts = async () => {
        const body = {
          method: "getTokenLargestAccounts",
          jsonrpc: "2.0",
          params: [
            // Get the public key of the account you want the balance for.
            mint,
            // add <object> (optional) Commitment
          ],
          "id":1,
        };
    
        const response = await fetch("https://solana-api.projectserum.com/", {
          method: "POST",
          body: JSON.stringify(body),
          headers: { "Content-Type": "application/json" },
        });
    
        const json = await response.json();
        const resultValues = json.result.value
        return resultValues;
      };
    
    const fetchTokenAccountData = async () => {
      let [largestTokenAccounts] = await Promise.all([GetLargestTokenAccounts()]);

      setLargestAccounts(largestTokenAccounts);
    }

    React.useEffect(() => { 
      if (!largestAccounts){
        fetchTokenAccountData();
      }
    }, [mint]);
    
    return (
      <React.Fragment>
            <Button
                variant="outlined" 
                //aria-controls={menuId}
                title={`Top 10 ${name} Holders`}
                onClick={handleClickOpen}
                size="small"
                >
                <AccountBalanceIcon sx={{mr:1}} /> Top 20 {name} Holders
            </Button>
            <BootstrapDialog
                onClose={handleClose}
                aria-labelledby="customized-dialog-title"
                open={open}
                PaperProps={{ 
                    style: {
                        background: 'linear-gradient(to right, #251a3a, #000000)',
                        boxShadow: '3',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderTop: '1px solid rgba(255,255,255,0.3)',
                        borderRadius: '20px',
                        padding:'4'
                        },
                    }}
            >
              <BootstrapDialogTitle id="customized-dialog-title" onClose={handleClose}>
                Top 10 {name} Holders
              </BootstrapDialogTitle>
              <DialogContent dividers>
                <TableContainer component={Paper}>
                  <Table sx={{ minWidth: 400 }} size="small" aria-label="a dense table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Address</TableCell>
                        <TableCell align="right">Holdings</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {largestAccounts ? largestAccounts.map((item: any) => (
                        <TableRow
                          key={item.address}
                          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                          <TableCell component="th" scope="row">  
                            {item.address}
                          </TableCell>
                          <TableCell align="right">
                            {item.uiAmountString}
                          </TableCell>
                        </TableRow>
                        ))
                        :
                        <React.Fragment>
                            <TableRow>
                                <TableCell><Skeleton/></TableCell>
                                <TableCell><Skeleton/></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell><Skeleton/></TableCell>
                                <TableCell><Skeleton/></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell><Skeleton/></TableCell>
                                <TableCell><Skeleton/></TableCell>
                            </TableRow>
                        </React.Fragment>
                      }
                    </TableBody>
                  </Table>
                </TableContainer>
              </DialogContent>
            </BootstrapDialog>
      </React.Fragment>
    );
}

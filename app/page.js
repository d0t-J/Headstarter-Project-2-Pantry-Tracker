"use client";
import { useState, useEffect } from "react";
import { firestore } from "@/firebase";
import {
  Box,
  Button,
  Modal,
  Select,
  Stack,
  TextField,
  Typography,
  MenuItem,
  InputLabel,
  FormControl,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Checkbox
} from "@mui/material";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import { styled } from "@mui/material/styles";

const InventoryBox = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: "10px",
  boxShadow: theme.shadows[3],
  width: "800px",
  margin: theme.spacing(2, 0),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
}));

const InventoryItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  backgroundColor: theme.palette.grey[100],
  padding: theme.spacing(2),
  margin: theme.spacing(1, 0),
  borderRadius: "5px",
  transition: "background-color 0.3s",
  "&:hover": {
    backgroundColor: theme.palette.grey[300],
  },
  "& .item-buttons": {
    display: "none",
    
  },
  "&:hover .item-buttons": {
    display: "flex",
    position:"absolute",
    alignItems: "right"
  },
  ".item-buttons": {
    position: "absolute",
  },
}));

const CircularButton = styled(Button)(({ theme }) => ({
  borderRadius: "50%",
  minWidth: "40px",
  width: "40px",
  height: "40px",
  padding: "0",
}));

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemCategory, setItemCategory] = useState("");
  const [modalType, setModalType] = useState("new");
  const [filterCategory, setFilterCategory] = useState("");
  const [promptOpen, setPromptOpen] = useState(false);
  const [promptItem, setPromptItem] = useState({ name: "", category: "", quantity: 1 });
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [filterInput, setFilterInput] = useState("");
  const [filterByName, setFilterByName] = useState(false);
  const [filterByCategory, setFilterByCategory] = useState(false);

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, "inventory"));
    const docs = await getDocs(snapshot);
    const inventoryList = [];

    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
    filterInventory(filterCategory, inventoryList);
  };

  const filterInventory = (category, inventoryList) => {
    let filteredList = inventoryList;
    if (category) {
      filteredList = filteredList.filter((item) =>
        item.category.toLowerCase().includes(category.toLowerCase())
      );
    }
    setFilteredInventory(filteredList);
  };

  const handleFilterChange = (e) => {
    setFilterInput(e.target.value);
    filterInventory(e.target.value, inventory);
  };

  const handleFilterByNameChange = (e) => {
    setFilterByName(e.target.checked);
  };

  const handleFilterByCategoryChange = (e) => {
    setFilterByCategory(e.target.checked);
  };

  const removeItem = async (item, quantityToRemove = 1) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity, category } = docSnap.data();
      if (quantity <= quantityToRemove) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { category, quantity: quantity - quantityToRemove });
      }
    }
    await updateInventory();
  };

  const addItem = async (item, category, quantity = 1) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity: existingQuantity, category: existingCategory } = docSnap.data();
      await setDoc(docRef, { category: existingCategory, quantity: existingQuantity + quantity });
    } else {
      await setDoc(docRef, { category, quantity });
    }
    await updateInventory();
  };

  const resetInventory = async () => {
    const batch = writeBatch(firestore);
    const snapshot = query(collection(firestore, "inventory"));
    const docs = await getDocs(snapshot);

    docs.forEach((doc) => {
      const docRef = doc.ref;
      batch.delete(docRef);
    });

    await batch.commit();
    await updateInventory();
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setItemName("");
    setItemQuantity(1);
    setItemCategory("");
    setModalType("new");
  };

  const handlePromptClose = () => {
    setPromptOpen(false);
    setPromptItem({ name: "", category: "", quantity: 1 });
  };

  const handlePromptConfirm = async () => {
    await addItem(promptItem.name, promptItem.category, promptItem.quantity);
    handlePromptClose();
  };

  const handleResetConfirmOpen = () => setResetConfirmOpen(true);
  const handleResetConfirmClose = () => setResetConfirmOpen(false);
  const handleResetConfirm = async () => {
    await resetInventory();
    handleResetConfirmClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted. Action:", modalType);

    if (modalType === "new") {
      await addItem(itemName, itemCategory, itemQuantity);
    } else if (modalType === "update") {
      const docRef = doc(collection(firestore, "inventory"), itemName);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const { quantity: existingQuantity, category: existingCategory } = docSnap.data();
        await setDoc(docRef, { category: existingCategory, quantity: existingQuantity + itemQuantity });
        await updateInventory();
      } else {
        setPromptItem({ name: itemName, category: itemCategory, quantity: itemQuantity });
        setPromptOpen(true);
      }
    } else if (modalType === "delete") {
      await removeItem(itemName, itemQuantity);
    }
    handleClose();
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap={2}
    >
      {/* Inventory Title */}
      <Typography variant="h4" gutterBottom>
        Inventory Management
      </Typography>

      {/* Manage and Reset Btns */}
      <Stack direction="row" spacing={2}>
        <Button variant="contained" onClick={handleOpen}>
          Manage
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleResetConfirmOpen}
        >
          Reset
        </Button>
      </Stack>

      {/* Filter Box */}
      <Box
        width="800px"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mt={2}
        mb={2}
      >
        <TextField
          label="Filter"
          variant="outlined"
          fullWidth
          value={filterInput}
          onChange={handleFilterChange}
          sx={{
            mr: 2,
          }}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={filterByName}
              onChange={handleFilterByNameChange}
            />
          }
          label="Name"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={filterByCategory}
              onChange={handleFilterByCategoryChange}
            />
          }
          label="Category"
        />
      </Box>

      {/* Inventory List: Items are displayed */}
      <InventoryBox>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          bgcolor="primary.light"
          p={2}
        >
          <Typography variant="subtitle1" sx={{ flex: 1, minWidth: '30%' }}>
            Name
          </Typography>
          <Typography variant="subtitle1" sx={{ flex: 1, minWidth: '30%' }}>
            Category
          </Typography>
          <Typography variant="subtitle1" sx={{ flex: 1, minWidth: '10%' }}>
            Qty
          </Typography>
        </Box>

        {filteredInventory.map((item) => (
          <InventoryItem key={item.name}>
            <Typography sx={{ flex: 1, minWidth: '30%' }}>{item.name}</Typography>
            <Typography sx={{ flex: 1, minWidth: '30%' }}>{item.category}</Typography>
            <Typography sx={{ flex: 1, minWidth: '10%' }}>{item.quantity}</Typography>
            <Box className="item-buttons" display="flex" gap={1}>
              <CircularButton
                variant="contained"
                color="primary"
                onClick={() => addItem(item.name, item.category)}
              >
                +
              </CircularButton>
              <CircularButton
                variant="contained"
                color="secondary"
                onClick={() => removeItem(item.name)}
              >
                -
              </CircularButton>
            </Box>
          </InventoryItem>
        ))}
      </InventoryBox>

      {/* Modal for Managing Items */}
      <Modal open={open} onClose={handleClose}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" gutterBottom>
            {modalType === "new"
              ? "Add New Item"
              : modalType === "update"
              ? "Update Item"
              : "Delete Item"}
          </Typography>
          <TextField
            label="Item Name"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          {modalType !== "delete" && (
            <TextField
              label="Item Category"
              value={itemCategory}
              onChange={(e) => setItemCategory(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
          )}
          <TextField
            label="Item Quantity"
            type="number"
            value={itemQuantity}
            onChange={(e) => setItemQuantity(e.target.value)}
            fullWidth
            margin="normal"
            required
            inputProps={{ min: 1 }}
          />
          <Box mt={2} display="flex" justifyContent="space-between">
            <Button variant="contained" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              {modalType === "new"
                ? "Add"
                : modalType === "update"
                ? "Update"
                : "Delete"}
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Prompt Dialog */}
      <Dialog open={promptOpen} onClose={handlePromptClose}>
        <DialogTitle>Item Not Found</DialogTitle>
        <DialogContent>
          <DialogContentText>
            The item <strong>{promptItem.name}</strong> does not exist. Would you like to add it with the specified quantity and category?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePromptClose}>Cancel</Button>
          <Button onClick={handlePromptConfirm} color="primary" variant="contained">
            Add Item
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Confirmation Dialog */}
      <Dialog open={resetConfirmOpen} onClose={handleResetConfirmClose}>
        <DialogTitle>Reset Inventory</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to reset the inventory? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleResetConfirmClose}>Cancel</Button>
          <Button onClick={handleResetConfirm} color="error" variant="contained">
            Reset
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

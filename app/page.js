"use client";
import Image from "next/image";
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
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import styled from "@emotion/styled";

const InventoryBox = styled(Box)`
  border: 1px solid #333;
  border-radius: 15px;
  width: 800px;
  background-color: #fafafa;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const InventoryItem = styled(Box)`
  width: 100%;
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #f0f0f0;
  padding: 1rem;
  border-radius: 10px;
  transition: background-color 0.3s ease;
  &:hover {
    background-color: #e0e0e0;
    .item-buttons {
      display: flex;
    }
  }
`;

const InventoryHeader = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #add8e6;
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 1rem;
`;

const ItemButton = styled(Button)`
  min-width: 30px;
  min-height: 30px;
  padding: 0.25rem;
  border-radius: 50%;
  transition: background-color 0.3s ease;
  &:hover {
    background-color: #ccc;
  }
`;

const TruncatedText = styled(Typography)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemCategory, setItemCategory] = useState("");
  const [modalType, setModalType] = useState("");
  const [promptOpen, setPromptOpen] = useState(false);
  const [promptItem, setPromptItem] = useState({ name: "", category: "" });
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [filterInput, setFilterInput] = useState("");
  const [filterByName, setFilterByName] = useState(true);
  const [filterByCategory, setFilterByCategory] = useState(false);
  const [filteredInventory, setFilteredInventory] = useState([]);

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
    filterInventory(inventoryList, filterInput, filterByName, filterByCategory);
  };

  const removeItem = async (item, quantityToRemove = 1) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity <= quantityToRemove) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - quantityToRemove });
      }
    }
    await updateInventory();
  };

  const addItem = async (item, category, quantity = 1) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity: existingQuantity } = docSnap.data();
      await setDoc(docRef, { category, quantity: existingQuantity + quantity });
    } else {
      await setDoc(docRef, { category, quantity });
    }
    await updateInventory();
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setItemName("");
    setItemQuantity(1);
    setItemCategory("");
    setModalType("");
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
        await addItem(itemName, itemCategory, itemQuantity);
      } else {
        setPromptItem({ name: itemName, category: itemCategory });
        setPromptOpen(true);
      }
    } else if (modalType === "delete") {
      await removeItem(itemName, itemQuantity);
    }
    handleClose();
  };

  const handlePromptClose = () => setPromptOpen(false);
  const handlePromptConfirm = async () => {
    await addItem(promptItem.name, promptItem.category, itemQuantity);
    setPromptOpen(false);
  };

  const handleResetConfirmOpen = () => setResetConfirmOpen(true);
  const handleResetConfirmClose = () => setResetConfirmOpen(false);
  const handleResetConfirm = async () => {
    const inventoryCollection = collection(firestore, "inventory");
    const snapshot = await getDocs(inventoryCollection);
    const batch = firestore.batch();

    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    await updateInventory();
    setResetConfirmOpen(false);
  };

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setFilterInput(value);
    filterInventory(inventory, value, filterByName, filterByCategory);
  };

  const handleFilterByNameChange = (e) => {
    setFilterByName(e.target.checked);
    filterInventory(inventory, filterInput, e.target.checked, filterByCategory);
  };

  const handleFilterByCategoryChange = (e) => {
    setFilterByCategory(e.target.checked);
    filterInventory(inventory, filterInput, filterByName, e.target.checked);
  };

  const filterInventory = (inventory, input, byName, byCategory) => {
    const lowercasedInput = input.toLowerCase();
    const filtered = inventory.filter((item) => {
      const nameMatch = item.name.toLowerCase().includes(lowercasedInput);
      const categoryMatch = item.category
        .toLowerCase()
        .includes(lowercasedInput);
      return (byName && nameMatch) || (byCategory && categoryMatch);
    });
    setFilteredInventory(filtered);
  };

  useEffect(() => {
    updateInventory();
  }, []);

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
      {/* Manage Inventory Dialog Box */}
      <Modal open={open} onClose={handleClose}>
        <Box
          component="form"
          position="absolute"
          top="50%"
          left="50%"
          width={400}
          bgcolor="white"
          border="2px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            transform: "translate(-50%, -50%)",
          }}
          onSubmit={handleSubmit}
        >
          <Typography variant="h6">Manage Entries</Typography>
          <FormControl fullWidth>
            <InputLabel id="action-label">Action</InputLabel>
            <Select
              value={modalType}
              onChange={(e) => setModalType(e.target.value)}
              label="Action"
              labelId="action-label"
            >
              <MenuItem value="" disabled>
                Select an action
              </MenuItem>
              <MenuItem value="new">New Item</MenuItem>
              <MenuItem value="update">Update Existing Item</MenuItem>
              <MenuItem value="delete">Remove Item</MenuItem>
            </Select>
          </FormControl>

          {modalType === "new" && (
            <>
              <TextField
                label="Item Name"
                variant="outlined"
                fullWidth
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
              <TextField
                label="Quantity"
                variant="outlined"
                fullWidth
                type="number"
                value={itemQuantity}
                onChange={(e) => setItemQuantity(Number(e.target.value))}
              />
              <TextField
                label="Category"
                variant="outlined"
                fullWidth
                value={itemCategory}
                onChange={(e) => setItemCategory(e.target.value)}
              />
            </>
          )}
          {modalType === "update" && (
            <>
              <TextField
                label="Item Name"
                variant="outlined"
                fullWidth
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
              <TextField
                label="Quantity to Add"
                variant="outlined"
                fullWidth
                type="number"
                value={itemQuantity}
                onChange={(e) => setItemQuantity(Number(e.target.value))}
              />
            </>
          )}

          {modalType === "delete" && (
            <>
              <TextField
                label="Item Name"
                variant="outlined"
                fullWidth
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
              <TextField
                label="Quantity to Remove"
                variant="outlined"
                fullWidth
                type="number"
                value={itemQuantity}
                onChange={(e) => setItemQuantity(Number(e.target.value))}
              />
            </>
          )}
          <Button variant="outlined" type="submit">
            {modalType === "new"
              ? "ADD"
              : modalType === "update"
              ? "UPDATE"
              : "DELETE"}
          </Button>
        </Box>
      </Modal>

      {/* Manage and Reset Buttons */}
      <Stack direction="row" spacing={2}>
        <Button variant="contained" onClick={handleOpen}>
          Manage Inventory
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleResetConfirmOpen}
        >
          Reset Inventory
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
          label="Search"
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
          label="Filter by Name"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={filterByCategory}
              onChange={handleFilterByCategoryChange}
            />
          }
          label="Filter by Category"
        />
      </Box>

      {/* Inventory List Heading */}
      <Typography variant="h4" mb={2}>
        Inventory List
      </Typography>

      {/* Inventory List: Items are displayed */}
      <InventoryBox>
        <InventoryHeader>
          <TruncatedText variant="h6" color="#333" width="33%">
            Name
          </TruncatedText>
          <TruncatedText variant="h6" color="#333" width="33%">
            Category
          </TruncatedText>
          <TruncatedText variant="h6" color="#333" width="33%">
            Qty.
          </TruncatedText>
        </InventoryHeader>

        <Stack width="100%" height="300px" spacing={2} overflow="auto">
          {filteredInventory.map(({ name, quantity, category }) => (
            <InventoryItem key={name} className="inventory-item">
              <TruncatedText variant="h6" color="#333" width="33%">
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </TruncatedText>
              <TruncatedText variant="h6" color="#333" width="33%">
                {category}
              </TruncatedText>
              <TruncatedText variant="h6" color="#333" width="33%">
                {quantity}
              </TruncatedText>
              <Stack
                direction="row"
                spacing={1}
                className="item-buttons"
                sx={{ display: "none" }}
              >
                <ItemButton
                  variant="contained"
                  onClick={() => {
                    removeItem(name);
                  }}
                >
                  -
                </ItemButton>
                <ItemButton
                  variant="contained"
                  onClick={() => {
                    addItem(name, category);
                  }}
                >
                  +
                </ItemButton>
              </Stack>
            </InventoryItem>
          ))}
        </Stack>
      </InventoryBox>

      {/* Prompt Dialog */}
      <Dialog open={promptOpen} onClose={handlePromptClose}>
        <DialogTitle>Item Not Found</DialogTitle>
        <DialogContent>
          <DialogContentText>
            The item "{promptItem.name}" was not found in the inventory. Would
            you like to add it?
          </DialogContentText>
          <TextField
            label="Category"
            variant="outlined"
            fullWidth
            value={promptItem.category}
            onChange={(e) =>
              setPromptItem({ ...promptItem, category: e.target.value })
            }
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePromptClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handlePromptConfirm} color="primary">
            Add Item
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Confirmation Dialog */}
      <Dialog open={resetConfirmOpen} onClose={handleResetConfirmClose}>
        <DialogTitle>Reset Inventory</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to reset the entire inventory? This action
            cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleResetConfirmClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleResetConfirm} color="primary">
            Reset
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

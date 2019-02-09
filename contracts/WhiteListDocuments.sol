
pragma solidity ^0.5.0;


// // @title IERC1643 Document Management (part of the ERC1400 Security Token Standards)
// /// @dev See https://github.com/SecurityTokenStandard/EIP-Spec

// interface IERC1643 {

//     // Document Management
//     function getDocument(bytes32 _name) external view returns (string memory, bytes32, uint256);
//     function setDocument(bytes32 _name, string calldata _uri, bytes32 _documentHash) external;
//     function removeDocument(bytes32 _name) external;
//     function getAllDocuments() external view returns (bytes32[] memory);

//     // Document Events
//     event DocumentRemoved(bytes32 indexed _name, string _uri, bytes32 _documentHash);
//     event DocumentUpdated(bytes32 indexed _name, string _uri, bytes32 _documentHash);

// }

/**
 * @title WhiteList implementation of ERC1643 Document management
 */
contract WhiteListDocuments {

    event AddToWhiteList(address indexed _added, address _by, uint256 _timestamp);
    event RemoveFromWhiteList(address indexed _removed, address _by, uint256 _timestamp);
    event TransferOwner(address indexed _newOwner, address _oldOwner, uint256 _timestamp);

    // Document Events
    event DocumentRemoved(bytes32 indexed _name, string _uri, bytes32 _documentHash);
    event DocumentUpdated(bytes32 indexed _name, string _uri, bytes32 _documentHash);

    struct Document {
        bytes32 docHash; 
        uint256 lastModified; // Timestamp.
        string uri; // location of the document that exist off-chain.
    }

    // owner of the contract.
    address public owner;
    // mapping to store authorized users.
    mapping(address => bool) public whiteList;
    // mapping from document name to the Document details.
    mapping(bytes32 => Document) public documents;
    // Array use to store all the document names present in the contracts.
    bytes32[] documentNames;
    
    /// Initialize contract.
    constructor() public {
        owner = msg.sender;
        whiteList[owner] = true;
        emit AddToWhiteList(msg.sender, address(this), now);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not the owner.");
        _;
    }

    modifier onlyWhiteList() {
        require(whiteList[msg.sender], "You are not on the white list.");
        _;
    }

    // Transfer ownership of the contract.
    function transferOwner(address _newOwner) public onlyOwner {
        if (!whiteList[_newOwner]) {
            whiteList[_newOwner] = true;
        }
        whiteList[owner] = false;
        emit RemoveFromWhiteList(owner, _newOwner, now);
        emit TransferOwner(_newOwner, owner, now);
        owner = _newOwner;
    }

    // Add user to the white list.
    function addToWhiteList(address _add) public onlyOwner {
        whiteList[_add] = true;
        emit AddToWhiteList(_add, owner, now);
    }

    // Remove user from the white list.
    function removeFromWhiteList(address _remove) public onlyOwner {
        whiteList[_remove] = false;
        emit RemoveFromWhiteList(_remove, owner, now);
    }
    
    // Add/Update document.
    function setDocument(bytes32 _name, string calldata _uri, bytes32 _documentHash) external onlyWhiteList {
        if (documents[_name].lastModified == 0) documentNames.push(_name);
        documents[_name] = Document(_documentHash, now, _uri);
        emit DocumentUpdated(_name, _uri, _documentHash);
    }

    // Remove document.
    function removeDocument(bytes32 _name) external onlyWhiteList {
        require(documents[_name].lastModified != uint256(0), "Document does not exist.");
        // Find element's index.
        for (uint i=0; i<documentNames.length; i++) {
            if (documentNames[i] == _name) {
                // If element is not the last index, swap positions.
                if (i < documentNames.length - 1) {
                    documentNames[i] = documentNames[documentNames.length - 1];
                }
                break;
            }
        }
        // Delete element.
        documentNames.pop();
        emit DocumentRemoved(_name, documents[_name].uri, documents[_name].docHash);
        // Delete document.
        delete documents[_name];
    } 

    // Get document details.
    function getDocument(bytes32 _name) external view returns (string memory, bytes32, uint256) {
        return (documents[_name].uri, documents[_name].docHash, documents[_name].lastModified);
    } 

    // Return array of all document names.
    function getAllDocuments() external view returns (bytes32[] memory) {
        return documentNames;
    }

}
# Design Patterns

Chossen patterns: ERC1643 (Document management) + Ownership + White List.

console output: 


Using network 'development'.

Compiling ./contracts/WhiteListDocuments.sol...


  Contract: OwnerDemo
    ✓ should set owner correctly (306ms)
    ✓ Should allow owner to call functions with the onlyOwner modifier. (618ms)
    ✓ Should fail if a non-owner calls functions with the onlyOwner modifier. (962ms)
    ✓ Should emit transfer event to logs. (49ms)

  Contract: WhiteListDocuments

Constructor:
    ✓ should set owner correctly. (335ms)
    ✓ Should add owner to the white list. (291ms)

Modifiers:
    ✓ Should allow owner to call functions with the onlyOwner modifier. (1568ms)
    ✓ Should fail if a non-owner calls functions with the onlyOwner modifier. (1052ms)
    ✓ Should allow white listed users to call functions with the onlyWhiteList modifier. (1596ms)
    ✓ Should fail if not white listed user calls functions with the onlyWhiteList modifier. (677ms)

Events:
    ✓ Should emit AddToWhiteList event to logs. (53ms)
    ✓ Should emit RemoveFromWhiteList event to logs. (53ms)
    ✓ Should emit TransferOwner event to logs. (60ms)
    ✓ Should emit DocumentUpdated event to logs. (58ms)
    ✓ Should emit DocumentRemoved event to logs. (60ms)

transferOwner:
    ✓ Should transfer contract to new owner. (360ms)
    ✓ Should add new owner to the white list. (293ms)
    ✓ Should remove old owner from the white list. (288ms)

addToWhiteList:
    ✓ Should add user to white list. (346ms)

removeFromWhiteList:
    ✓ Should remove user from white list. (343ms)

setDocument:
    ✓ Should add new document to contract from owner. (355ms)
    ✓ Should add new document to contract from white list user. (456ms)
    ✓ Should update document to contract from owner. (348ms)
    ✓ Should update document to contract from white list user. (348ms)

removeDocument:
    ✓ Should remove low index document by owner. (354ms)
    ✓ Should remove document by white list user. (356ms)

getDocument:
    ✓ Should retrieve document details. (312ms)


  27 passing (15s)

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenSwap is Ownable {
    IERC20 public token1;
    IERC20 public token2;

    uint256 public rateToken1ToToken2;
    uint256 public rateToken2ToToken1;

    event Swapped(address indexed user, address fromToken, address toToken, uint256 amountIn, uint256 amountOut);
    event DebugSwap(address user, uint256 amountIn, uint256 amountOut, uint256 contractToken2Balance);

    constructor(address _token1, address _token2, uint256 _rate1to2, uint256 _rate2to1) Ownable(msg.sender) {
        require(_token1 != address(0) && _token2 != address(0), "Invalid token address");
        require(_rate1to2 > 0 && _rate2to1 > 0, "Invalid exchange rate");

        token1 = IERC20(_token1);
        token2 = IERC20(_token2);
        rateToken1ToToken2 = _rate1to2;
        rateToken2ToToken1 = _rate2to1;
    }

    function swapToken1ForToken2(uint256 amountIn) external returns (uint256) {
        require(amountIn > 0, "Amount must be greater than zero");

        uint256 amountOut = (amountIn * rateToken1ToToken2) / 1e18;
        require(amountOut > 0, "Swap amount too low");

        uint256 contractToken2Balance = token2.balanceOf(address(this));
        emit DebugSwap(msg.sender, amountIn, amountOut, contractToken2Balance);

        require(contractToken2Balance >= amountOut, "Not enough Token2 in contract");

        require(token1.transferFrom(msg.sender, address(this), amountIn), "Token1 transfer failed");
        require(token2.transfer(msg.sender, amountOut), "Token2 transfer failed");

        emit Swapped(msg.sender, address(token1), address(token2), amountIn, amountOut);
        return amountOut;
    }

    function swapToken2ForToken1(uint256 amountIn) external returns (uint256) {
        require(amountIn > 0, "Amount must be greater than zero");

        uint256 amountOut = (amountIn * rateToken2ToToken1) / 1e18;
        require(amountOut > 0, "Swap amount too low");

        require(token2.transferFrom(msg.sender, address(this), amountIn), "Token2 transfer failed");
        require(token1.transfer(msg.sender, amountOut), "Token1 transfer failed");

        emit Swapped(msg.sender, address(token2), address(token1), amountIn, amountOut);
        return amountOut;
    }

    function setExchangeRates(uint256 _rate1to2, uint256 _rate2to1) external onlyOwner {
        require(_rate1to2 > 0 && _rate2to1 > 0, "Invalid exchange rate");
        rateToken1ToToken2 = _rate1to2;
        rateToken2ToToken1 = _rate2to1;
    }

    function withdrawTokens(address token, uint256 amount) external onlyOwner {
        require(IERC20(token).transfer(owner(), amount), "Withdraw failed");
    }
}
